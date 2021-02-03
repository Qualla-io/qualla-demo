import { Approval, Transfer } from "../generated/Dai/TestDai";
import { User, Transaction } from "../generated/schema";

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

  // create transaction
  let _id = event.transaction.hash.toHex();
  let trans = new Transaction(_id);
  trans.from = src;
  trans.to = dst;
  trans.amount = event.params.wad;
  trans.timestamp = event.block.timestamp;
  trans.save();
}
