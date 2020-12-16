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

import { BigInt } from "@graphprotocol/graph-ts";
import { log } from "@graphprotocol/graph-ts";

export function handleNFTevent(event: NFTevent): void {
  let nftToken = new NftToken(event.params.id.toHex());
  nftToken.save();
}

export function handleTransferBatch(event: TransferBatch): void {
  let contract = SubscriptionV1.bind(event.address);
  let _tokenIds = event.params.ids;
  let _values = event.params.values;
  for (var i = 0; i < event.params.ids.length; i++) {
    let _tokenId = _tokenIds[i];
    let tokenId = _tokenId.toString();
    let hexedID = _tokenId.toHex();
    let value = _values[i];
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
        baseToken.quantity = baseToken.quantity.minus(value);

        baseToken.save();
      } else if (hexedID.slice(-17) == "fffffffffffffffff") {
        // NFT Token
      } else {
        // Sub Token
        let subToken = SubscriptionToken.load(tokenId);
        subToken.owner = null;

        subToken.save();
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
        user.nonce = BigInt.fromI32(0);
      } else {
        user.nonce = contract.userNonce(event.params.to);
      }

      if (hexedID[hexedID.length - 1] == "0") {
        // Base Token
        let baseToken = BaseToken.load(tokenId);
        if (baseToken == null) {
          baseToken = new BaseToken(tokenId);
          baseToken.quantity = value;
          baseToken.owner = user.id;
          baseToken.testID = hexedID;
          baseToken.paymentValue = contract.tokenIdToPaymentValue(_tokenId);
          baseToken.paymentToken = contract
            .tokenIdToPaymentToken(_tokenId)
            .toHexString();
        } else {
          baseToken.quantity = baseToken.quantity.minus(value);
        }

        baseToken.save();
      } else if (hexedID.slice(-17) == "fffffffffffffffff") {
        // NFT Token
      } else {
        // Sub Token
        let subToken = new SubscriptionToken(tokenId);
        let baseToken = BaseToken.load(
          contract.getBaseIdFromToken(_tokenId).toString()
        );
        subToken.baseToken = baseToken.id;
        subToken.owner = user.id;
        subToken.creator = baseToken.owner;
        subToken.nextWithdraw = contract.tokenId_ToNextWithdraw(_tokenId);
        subToken.testID = hexedID;

        subToken.save();
      }

      user.save();
    } else {
      // transfer tokens
      let userFrom = User.load(idFrom);
      if (userFrom == null) {
        userFrom = new User(idFrom);
        userFrom.nonce = BigInt.fromI32(0);
      }

      let userTo = User.load(idTo);
      if (userTo == null) {
        userTo = new User(idTo);
        userTo.nonce = BigInt.fromI32(0);
      }

      if (hexedID[hexedID.length - 1] == "0") {
        // base token
        let baseToken = BaseToken.load(tokenId);
        if (baseToken.quantity == value) {
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

      baseToken.save();
    } else if (hexedID.slice(-17) == "fffffffffffffffff") {
      // NFT Token
    } else {
      // Sub Token
      let subToken = SubscriptionToken.load(tokenId);
      subToken.owner = null;

      subToken.save();
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
      user.nonce = BigInt.fromI32(0);
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
      subToken.baseToken = baseToken.id;
      subToken.owner = user.id;
      subToken.creator = baseToken.owner;
      subToken.nextWithdraw = contract.tokenId_ToNextWithdraw(event.params.id);
      subToken.testID = hexedID;

      subToken.save();
    }

    user.save();
  } else {
    // transfer tokens
    let userFrom = User.load(idFrom);
    if (userFrom == null) {
      userFrom = new User(idFrom);
      userFrom.nonce = BigInt.fromI32(0);
    }

    let userTo = User.load(idTo);
    if (userTo == null) {
      userTo = new User(idTo);
      userTo.nonce = BigInt.fromI32(0);
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
