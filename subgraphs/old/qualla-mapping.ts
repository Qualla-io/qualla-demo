import { TransferSingle, TransferBatch } from "../generated/Qualla/IERC1155";
import { ERC1155 } from "../generated/Qualla/ERC1155";
import { TierTokenFacet } from "../generated/Qualla/TierTokenFacet";
import { BeamTokenFacet } from "../generated/Qualla/BeamTokenFacet";

import { User, TierToken, BeamToken, NftToken } from "../generated/schema";

import { BigInt, store } from "@graphprotocol/graph-ts";

export function handleTransferBatch(event: TransferBatch): void {
  let contract = ERC1155.bind(event.address);
  let tierFacet = TierTokenFacet.bind(event.address);
  let beamFacet = BeamTokenFacet.bind(event.address);
  let _tokenIds = event.params.ids;
  let _values = event.params.values;

  let idTo = event.params.to.toHexString();
  let idFrom = event.params.from.toHexString();

  let userTo = User.load(idTo);
  if (userTo == null) {
    userTo = new User(idTo);
  }
  // This is lazy but works for now
  userTo.nonce = contract.getUserNonce(event.params.to);

  let userFrom = User.load(idFrom);
  if (userFrom == null) {
    userFrom = new User(idFrom);
  }
  userFrom.nonce = contract.getUserNonce(event.params.from);

  if (
    idTo != "0x0000000000000000000000000000000000000000" &&
    idFrom == "0x0000000000000000000000000000000000000000"
  ) {
    // Minting tokens. All must be the same type (base, sub, nft)
    let hexedID = _tokenIds[0].toHex();

    // Test for NFT
    // Pretty sure this will work until token nonce hits top 4 bits. Should be dead or too rich to care by then
    if (hexedID.slice(0, 3) == "0x8") {
      // NFT Token
      let uri = contract.uri(_tokenIds[0]);
      for (var i = 0; i < event.params.ids.length; i++) {
        let _tokenId = _tokenIds[i];
        let tokenId = _tokenId.toString();
        hexedID = _tokenId.toHex();

        let nft = new NftToken(tokenId);
        nft.owner = userTo.id;
        nft.creator = userTo.id;
        nft.uriID = uri;
        nft.testID = hexedID;

        nft.save();
      }
    } else if (hexedID[hexedID.length - 1] == "0") {
      // Base Token
      for (i = 0; i < event.params.ids.length; i++) {
        let _tokenId = _tokenIds[i];
        let tokenId = _tokenId.toString();
        hexedID = _tokenId.toHex();
        let value = _values[i];

        let baseToken = TierToken.load(tokenId);

        if (baseToken == null) {
          baseToken = new TierToken(tokenId);
          baseToken.quantity = value;
          baseToken.initialSupply = value;
          baseToken.owner = userTo.id;
          baseToken.testID = hexedID;
          let _token = tierFacet.getTierToken(_tokenId);
          baseToken.paymentValue = _token.flowRate;
          baseToken.paymentToken = _token.paymentToken.toHexString();
          baseToken.txHash =
            event.transaction.hash.toHex() + "-" + i.toString();

          // baseToken.index = BigInt.fromI32(1);
        } else {
          baseToken.quantity = baseToken.quantity.minus(value);
        }

        baseToken.save();
      }
    } else {
      // Sub Token
      for (i = 0; i < event.params.ids.length; i++) {
        let _tokenId = _tokenIds[i];
        let tokenId = _tokenId.toString();
        hexedID = _tokenId.toHex();
        let beamToken = new BeamToken(tokenId);
        let tierToken = TierToken.load(
          beamFacet.getTierIdFromBeamToken(_tokenId).toString()
        );
        beamToken.baseToken = tierToken.id;
        beamToken.owner = userTo.id;
        beamToken.creator = tierToken.owner;
        beamToken.nextWithdraw = BigInt.fromI32(0);
        beamToken.testID = hexedID;
        beamToken.flowRate = tierToken.flowrate;

        beamToken.save();

        // update user flows
      }
    }
  } else if (
    idTo == "0x0000000000000000000000000000000000000000" &&
    idFrom != "0x0000000000000000000000000000000000000000"
  ) {
    // Burning tokens. All must be the same type (base, sub, nft) for now. May change in future.
    let hexedID = _tokenIds[0].toHex();
    if (hexedID.slice(0, 3) == "0x8") {
      // NFT Burning
      for (i = 0; i < event.params.ids.length; i++) {
        let _tokenId = _tokenIds[i];
        let tokenId = _tokenId.toString();

        // Maybe just set flag as burned instead of deleting?
        store.remove("NftToken", tokenId);
      }
    } else if (hexedID[hexedID.length - 1] == "0") {
      // Base Token Burning
      for (i = 0; i < event.params.ids.length; i++) {
        let _tokenId = _tokenIds[i];
        let tokenId = _tokenId.toString();
        hexedID = _tokenId.toHex();
        let value = _values[i];

        let baseToken = BaseToken.load(tokenId);
        baseToken.quantity = baseToken.quantity.minus(value);

        baseToken.save();

        if (
          baseToken.quantity == BigInt.fromI32(0) &&
          baseToken.activeTokens.length == 0
        ) {
          // User has burnt all tokens.
          // better way than to just delete?
          store.remove("BaseToken", tokenId);
        }
      }
    } else {
      // Sub Token Burning
      for (i = 0; i < event.params.ids.length; i++) {
        let _tokenId = _tokenIds[i];
        let tokenId = _tokenId.toString();
        // maybe a better way than just delete?
        store.remove("SubscriptionToken", tokenId);
      }
    }
  } else {
    // Transfer between people. Could be a collection of different tokens
    for (i = 0; i < event.params.ids.length; i++) {
      let _tokenId = _tokenIds[i];
      let tokenId = _tokenId.toString();
      let hexedID = _tokenId.toHex();
      let value = _values[i];
      if (hexedID.slice(0, 3) == "0x8") {
        // NFT transfer
        let nft = NftToken.load(tokenId);
        nft.owner = userTo.id;

        nft.save();
      } else if (hexedID[hexedID.length - 1] == "0") {
        // base token
        let baseToken = BaseToken.load(tokenId);
        if (baseToken.quantity == value) {
          // transfering all coins to new address
          baseToken.owner = userTo.id;
        } else {
          // How to handle partial transfer?
        }
        baseToken.save();
      } else {
        // sub token
        let subToken = SubscriptionToken.load(tokenId);
        subToken.owner = userTo.id;

        subToken.save();
      }
    }
  }
  userTo.save();
  userFrom.save();
}

export function handleTransferSingle(event: TransferSingle): void {
  let contract = ERC1155.bind(event.address);
  let subscriptionFacet = SubscriptionFacet.bind(event.address);

  let _tokenId = event.params.id;
  let tokenId = event.params.id.toString();
  let hexedID = event.params.id.toHex();
  let value = event.params.value;

  let idTo = event.params.to.toHexString();
  let idFrom = event.params.from.toHexString();

  let userTo = User.load(idTo);
  if (userTo == null) {
    userTo = new User(idTo);
  }
  // This is lazy but works for now
  userTo.nonce = contract.getUserNonce(event.params.to);

  let userFrom = User.load(idFrom);
  if (userFrom == null) {
    userFrom = new User(idFrom);
  }
  userFrom.nonce = contract.getUserNonce(event.params.from);

  if (
    idTo != "0x0000000000000000000000000000000000000000" &&
    idFrom == "0x0000000000000000000000000000000000000000"
  ) {
    // Minting token
    if (hexedID.slice(0, 3) == "0x8") {
      // NFT Token
      let nft = new NftToken(tokenId);
      nft.owner = userTo.id;
      nft.creator = userTo.id;
      nft.uriID = contract.uri(event.params.id);
      nft.testID = hexedID;

      nft.save();
    } else if (hexedID[hexedID.length - 1] == "0") {
      // Base Token
      let baseToken = BaseToken.load(tokenId);
      if (baseToken == null) {
        baseToken = new BaseToken(tokenId);
        baseToken.quantity = value;
        baseToken.initialSupply = value;
        baseToken.owner = userTo.id;
        baseToken.testID = hexedID;
        let _token = subscriptionFacet.getBaseToken(_tokenId);
        baseToken.paymentValue = _token.paymentValue;
        baseToken.paymentToken = _token.paymentToken.toHexString();
        baseToken.txHash = event.transaction.hash.toHex() + "-" + "0";

        // baseToken.index = BigInt.fromI32(1);
      } else {
        baseToken.quantity = baseToken.quantity.minus(value);
      }

      baseToken.save();
    } else {
      // Sub Token
      let subToken = new SubscriptionToken(tokenId);
      let baseToken = BaseToken.load(
        subscriptionFacet.getBaseIdFromToken(_tokenId).toString()
      );
      subToken.baseToken = baseToken.id;
      subToken.owner = userTo.id;
      subToken.creator = baseToken.owner;
      subToken.nextWithdraw = BigInt.fromI32(0);
      subToken.testID = hexedID;

      subToken.save();
    }
  } else if (
    idTo == "0x0000000000000000000000000000000000000000" &&
    idFrom != "0x0000000000000000000000000000000000000000"
  ) {
    // Burning Token
    if (hexedID.slice(0, 3) == "0x8") {
      // Burn NFT

      // Maybe just set flag as burned instead of deleting?
      store.remove("NftToken", tokenId);
    } else if (hexedID[hexedID.length - 1] == "0") {
      // Burn Base Token

      let baseToken = BaseToken.load(tokenId);
      baseToken.quantity = baseToken.quantity.minus(value);

      baseToken.save();

      if (
        baseToken.quantity == BigInt.fromI32(0) &&
        baseToken.activeTokens.length == 0
      ) {
        // User has burnt all tokens.
        // better way than to just delete?
        store.remove("BaseToken", tokenId);
      }
    } else {
      // Burn Sub Token

      store.remove("SubscriptionToken", tokenId);
    }
  } else {
    // Transfer between people.
    if (hexedID.slice(0, 3) == "0x8") {
      // Transfer NFT
      let nft = NftToken.load(tokenId);
      nft.owner = userTo.id;

      nft.save();
    } else if (hexedID[hexedID.length - 1] == "0") {
      // Transfer Base Token
      let baseToken = BaseToken.load(tokenId);
      if (baseToken.quantity == value) {
        // transfering all coins to new address
        baseToken.owner = userTo.id;
      } else {
        // How to handle partial transfer?
      }
      baseToken.save();
    } else {
      // Transfer Sub Token
      let subToken = SubscriptionToken.load(tokenId);
      subToken.owner = userTo.id;

      subToken.save();
    }
  }

  userTo.save();
  userFrom.save();
}
