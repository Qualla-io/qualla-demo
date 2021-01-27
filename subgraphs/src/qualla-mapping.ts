import {
  TransferSingle,
  TransferBatch,
} from "../generated/SubscriptionV1/IERC1155";
import {
  SubscriptionV1,
  NFTevent,
} from "../generated/SubscriptionV1/SubscriptionV1";
import {
  User,
  BaseToken,
  SubscriptionToken,
  NftToken,
} from "../generated/schema";

import { BigInt, store } from "@graphprotocol/graph-ts";


export function handleNFTevent(event: NFTevent): void {
  let nftToken = new NftToken(event.params.id.toHex());
  nftToken.save();
}

export function handleTransferBatch(event: TransferBatch): void {
  let contract = SubscriptionV1.bind(event.address);
  let _tokenIds = event.params.ids;
  let _values = event.params.values;

  let idTo = event.params.to.toHexString();
  let idFrom = event.params.from.toHexString();

  let userTo = User.load(idTo);
  if (userTo == null) {
    userTo = new User(idTo);
  }
  // This is lazy but works for now
  userTo.nonce = contract.userNonce(event.params.to);

  let userFrom = User.load(idFrom);
  if (userFrom == null) {
    userFrom = new User(idFrom);
  }
  userFrom.nonce = contract.userNonce(event.params.from);

  let hexedID;

  if (
    idTo != "0x0000000000000000000000000000000000000000" &&
    idFrom == "0x0000000000000000000000000000000000000000"
  ) {
    // Minting tokens. All must be the same type (base, sub, nft)
    hexedID = _tokenIds[0];

    // Test for NFT
    // Check this
    if (hexedID.slice(-17) == "fffffffffffffffff") {
      // NFT Token
      let uri = contract.uri(_tokenIds[0]);
      for (var i = 0; i < event.params.ids.length; i++) {
        let _tokenId = _tokenIds[i];
        let tokenId = _tokenId.toString();
        hexedID = _tokenId.toHex();

        let nft = new NftToken(tokenId);
        nft.owner = userTo.id;
        nft.creator = userTo.id;
        nft.uri = uri;
        nft.testID = hexedID;

        nft.save();
      }
    } else if (hexedID[hexedID.length - 1] == "0") {
      // Base Token
      for (var i = 0; i < event.params.ids.length; i++) {
        let _tokenId = _tokenIds[i];
        let tokenId = _tokenId.toString();
        hexedID = _tokenId.toHex();
        let value = _values[i];

        let baseToken = BaseToken.load(tokenId);
        // this must not be null when not found
        if (baseToken == null) {
          baseToken = new BaseToken(tokenId);
          baseToken.quantity = value;
          baseToken.initialSupply = value;
          baseToken.owner = userTo.id;
          baseToken.testID = hexedID;
          baseToken.paymentValue = contract.tokenIdToPaymentValue(_tokenId);
          baseToken.paymentToken = contract
            .tokenIdToPaymentToken(_tokenId)
            .toHexString();
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
      for (var i = 0; i < event.params.ids.length; i++) {
        let _tokenId = _tokenIds[i];
        let tokenId = _tokenId.toString();
        hexedID = _tokenId.toHex();
        let subToken = new SubscriptionToken(tokenId);
        let baseToken = BaseToken.load(
          contract.getBaseIdFromToken(_tokenId).toString()
        );
        subToken.baseToken = baseToken.id;
        subToken.owner = userTo.id;
        subToken.creator = baseToken.owner;
        subToken.nextWithdraw = contract.tokenId_ToNextWithdraw(_tokenId);
        subToken.testID = hexedID;

        subToken.save();
      }
    }
  } else if (
    idTo != "0x0000000000000000000000000000000000000000" &&
    idFrom == "0x0000000000000000000000000000000000000000"
  ) {
    // Burning tokens. All must be the same type (base, sub, nft) for now. May change in future.
    hexedID = _tokenIds[0];
    if (hexedID.slice(-17) == "fffffffffffffffff") {
      // NFT Burning
      for (var i = 0; i < event.params.ids.length; i++) {
        let _tokenId = _tokenIds[i];
        let tokenId = _tokenId.toString();

        // Maybe just set flag as burned instead of deleting?
        store.remove("NftToken", tokenId);
      }
    } else if (hexedID[hexedID.length - 1] == "0") {
      // Base Token Burning
      for (var i = 0; i < event.params.ids.length; i++) {
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
      for (var i = 0; i < event.params.ids.length; i++) {
        let _tokenId = _tokenIds[i];
        let tokenId = _tokenId.toString();
        // maybe a better way than just delete?
        store.remove("SubscriptionToken", tokenId);
      }
    }
  } else {
    // Transfer between people. Could be a collection of different tokens
    for (var i = 0; i < event.params.ids.length; i++) {
      let _tokenId = _tokenIds[i];
      let tokenId = _tokenId.toString();
      hexedID = _tokenId.toHex();
      let value = _values[i];
      if (hexedID.slice(-17) == "fffffffffffffffff") {
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
  let contract = SubscriptionV1.bind(event.address);

  let tokenId = event.params.id.toString();
  let hexedID = event.params.id.toHex();
  // test to see if this is an NFT or not

  let idTo = event.params.to.toHexString();
  let idFrom = event.params.from.toHexString();

  if (
    idTo == "0x0000000000000000000000000000000000000000" &&
    idFrom != "0x0000000000000000000000000000000000000000"
  ) {
    // burn tokens

    let user = User.load(idFrom);
    user.nonce = contract.userNonce(event.params.from);

    if (hexedID[hexedID.length - 1] == "0") {
      // Base Token
      let baseToken = BaseToken.load(tokenId);
      baseToken.quantity = baseToken.quantity.minus(event.params.value);

      // This doesn't seem to be working
      if (idFrom == baseToken.owner) {
        baseToken.initialSupply = baseToken.initialSupply.minus(
          event.params.value
        );
      }

      baseToken.save();

      if (baseToken.initialSupply == BigInt.fromI32(0)) {
        // better way than to just delete?
        store.remove("BaseToken", tokenId);
      }
    } else if (hexedID.slice(-17) == "fffffffffffffffff") {
      // NFT Token
    } else {
      // Sub Token

      // maybe a better way than to just delete?
      store.remove("SubscriptionToken", tokenId);
      // let subToken = SubscriptionToken.load(tokenId);
      // subToken.owner = null;
      // subToken.baseToken = null;
      // subToken.save()
    }

    user.save();
  } else if (
    idTo != "0x0000000000000000000000000000000000000000" &&
    idFrom == "0x0000000000000000000000000000000000000000"
  ) {
    // mint tokens
    let user = User.load(idTo);
    if (user == null) {
      user = new User(idTo);
      user.nonce = BigInt.fromI32(1);
    } else {
      user.nonce = contract.userNonce(event.params.to);
    }

    if (hexedID[hexedID.length - 1] == "0") {
      // Base Token
      let baseToken = BaseToken.load(tokenId);
      if (baseToken == null) {
        baseToken = new BaseToken(tokenId);
        baseToken.quantity = event.params.value;
        baseToken.owner = user.id;
        baseToken.testID = hexedID;
        baseToken.paymentValue = contract.tokenIdToPaymentValue(
          event.params.id
        );
        baseToken.paymentToken = contract
          .tokenIdToPaymentToken(event.params.id)
          .toHexString();
        baseToken.txHash = event.transaction.hash.toHex() + "-" + "0";
        baseToken.initialSupply = event.params.value;
        // baseToken.index = BigInt.fromI32(1);
      } else {
        baseToken.quantity = baseToken.quantity.minus(event.params.value);
      }

      baseToken.save();
    } else if (hexedID.slice(-17) == "fffffffffffffffff") {
      // NFT Token
    } else {
      // Sub Token
      let subToken = new SubscriptionToken(tokenId);
      let baseToken = BaseToken.load(
        contract.getBaseIdFromToken(event.params.id).toString()
      );
      // baseToken.index = baseToken.index.plus(BigInt.fromI32(1));
      subToken.baseToken = baseToken.id;
      subToken.owner = user.id;
      subToken.creator = baseToken.owner;
      subToken.nextWithdraw = contract.tokenId_ToNextWithdraw(event.params.id);
      subToken.testID = hexedID;

      baseToken.save();
      subToken.save();
    }

    user.save();
  } else {
    // transfer tokens
    let userFrom = User.load(idFrom);
    if (userFrom == null) {
      userFrom = new User(idFrom);
      userFrom.nonce = BigInt.fromI32(0); //Check this
    }

    let userTo = User.load(idTo);
    if (userTo == null) {
      userTo = new User(idTo);
      userTo.nonce = BigInt.fromI32(0); //Check this
    }

    if (hexedID[hexedID.length - 1] == "0") {
      // base token
      let baseToken = BaseToken.load(tokenId);
      if (baseToken.quantity == event.params.value) {
        // transfering all coins to new address
        baseToken.owner = userTo.id;
      } else {
        // How to handle partial transfer?
      }
      baseToken.save();
    } else if (hexedID.slice(-17) == "fffffffffffffffff") {
      // NFT Token
    } else {
      // sub token
      let subToken = SubscriptionToken.load(tokenId);
      subToken.owner = userTo.id;

      subToken.save();
    }

    userFrom.save();
    userTo.save();
  }
}
