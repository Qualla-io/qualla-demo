import { Approval, Transfer } from "../generated/Dai/TestDai";
import { User } from "../generated/schema";

import { BigInt, store } from "@graphprotocol/graph-ts";

export function handleDaiApproval(event: Approval): void {
  let src = event.params.src.toHexString();
  let user = User.load(src);
  if (user == null) {
    user = new User(src);
    user.nonce = BigInt.fromI32(0);
  }
  user.approved = true;

  user.save();
}

export function handleDaiTransfer(event: Transfer): void {
  let src = event.params.src.toHexString();
  let dst = event.params.dst.toHexString();

  // subtract from src
  if (src != "0x0000000000000000000000000000000000000000") {
    let srcUser = User.load(src);
    if (srcUser == null) {
      srcUser = new User(src);
      srcUser.balance = BigInt.fromI32(0);
      srcUser.nonce = BigInt.fromI32(0);
    }
    srcUser.balance = srcUser.balance.minus(event.params.wad);
    srcUser.save();
  }

  // add to dst
  if (dst != "0x0000000000000000000000000000000000000000") {
    let dstUser = User.load(dst);
    if (dstUser == null) {
      dstUser = new User(dst);
      dstUser.balance = BigInt.fromI32(0);
      dstUser.nonce = BigInt.fromI32(0);
    }
    dstUser.balance = dstUser.balance.plus(event.params.wad);
    dstUser.save();
  }
}

//     let user = User.load(idFrom);
//     user.nonce = contract.userNonce(event.params.from);

//     if (hexedID[hexedID.length - 1] == "0") {
//       // Base Token
//       let baseToken = BaseToken.load(tokenId);
//       baseToken.quantity = baseToken.quantity.minus(event.params.value);

//       // This doesn't seem to be working
//       if (idFrom == baseToken.owner) {

//         baseToken.initialSupply = baseToken.initialSupply.minus(
//           event.params.value
//         );
//       }

//       baseToken.save();

//       if (baseToken.initialSupply == BigInt.fromI32(0)) {
//         // better way than to just delete?
//         store.remove("BaseToken", tokenId);
//       }
//     } else if (hexedID.slice(-17) == "fffffffffffffffff") {
//       // NFT Token
//     } else {
//       // Sub Token

//       // maybe a better way than to just delete?
//       store.remove("SubscriptionToken", tokenId);
//       // let subToken = SubscriptionToken.load(tokenId);
//       // subToken.owner = null;
//       // subToken.baseToken = null;
//       // subToken.save()
//     }

//     user.save();
//   } else if (
//     idTo != "0x0000000000000000000000000000000000000000" &&
//     idFrom == "0x0000000000000000000000000000000000000000"
//   ) {
//     // mint tokens
//     let user = User.load(idTo);
//     if (user == null) {
//       user = new User(idTo);
//       user.nonce = BigInt.fromI32(1);
//     } else {
//       user.nonce = contract.userNonce(event.params.to);
//     }

//     if (hexedID[hexedID.length - 1] == "0") {
//       // Base Token
//       let baseToken = BaseToken.load(tokenId);
//       if (baseToken == null) {
//         baseToken = new BaseToken(tokenId);
//         baseToken.quantity = event.params.value;
//         baseToken.owner = user.id;
//         baseToken.testID = hexedID;
//         baseToken.paymentValue = contract.tokenIdToPaymentValue(
//           event.params.id
//         );
//         baseToken.paymentToken = contract
//           .tokenIdToPaymentToken(event.params.id)
//           .toHexString();
//         baseToken.txHash = event.transaction.hash.toHex() + "-" + "0";
//         baseToken.initialSupply = event.params.value;
//         baseToken.index = BigInt.fromI32(1);
//       } else {
//         baseToken.quantity = baseToken.quantity.minus(event.params.value);
//       }

//       baseToken.save();
//     } else if (hexedID.slice(-17) == "fffffffffffffffff") {
//       // NFT Token
//     } else {
//       // Sub Token
//       let subToken = new SubscriptionToken(tokenId);
//       let baseToken = BaseToken.load(
//         contract.getBaseIdFromToken(event.params.id).toString()
//       );
//       baseToken.index = baseToken.index.plus(BigInt.fromI32(1));
//       subToken.baseToken = baseToken.id;
//       subToken.owner = user.id;
//       subToken.creator = baseToken.owner;
//       subToken.nextWithdraw = contract.tokenId_ToNextWithdraw(event.params.id);
//       subToken.testID = hexedID;

//       baseToken.save();
//       subToken.save();
//     }

//     user.save();
//   } else {
//     // transfer tokens
//     let userFrom = User.load(idFrom);
//     if (userFrom == null) {
//       userFrom = new User(idFrom);
//       userFrom.nonce = BigInt.fromI32(0); //Check this
//     }

//     let userTo = User.load(idTo);
//     if (userTo == null) {
//       userTo = new User(idTo);
//       userTo.nonce = BigInt.fromI32(0); //Check this
//     }

//     if (hexedID[hexedID.length - 1] == "0") {
//       // base token
//       let baseToken = BaseToken.load(tokenId);
//       if (baseToken.quantity == event.params.value) {
//         // transfering all coins to new address
//         baseToken.owner = userTo.id;
//       } else {
//         // How to handle partial transfer?
//       }
//       baseToken.save();
//     } else if (hexedID.slice(-17) == "fffffffffffffffff") {
//       // NFT Token
//     } else {
//       // sub token
//       let subToken = SubscriptionToken.load(tokenId);
//       subToken.owner = userTo.id;

//       subToken.save();
//     }

//     userFrom.save();
//     userTo.save();
//   }
// }
