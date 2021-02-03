import { Balance, User } from "../generated/schema";
import { Transfer, Settle } from "../generated/templates/Qtoken/Qtoken";

import { BigInt } from "@graphprotocol/graph-ts";
import { Qtoken } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  let idTo = event.params.to.toHexString();
  let idFrom = event.params.from.toHexString();
  let qtoken = Qtoken.load(event.address.toHexString());

  let userTo = User.load(idTo);

  if (userTo == null && idTo != "0x0000000000000000000000000000000000000000") {
    // new user
    userTo = new User(idTo);
    userTo.nonce = BigInt.fromI32(0);
  }

  let toBalance = Balance.load(`${idTo}-${event.address.toHexString()}`);
  if (
    toBalance == null &&
    idTo != "0x0000000000000000000000000000000000000000"
  ) {
    // new balance
    toBalance = new Balance(`${idTo}-${event.address.toHexString()}`);
    toBalance.settledBalance = BigInt.fromI32(0);
  }

  let userFrom = User.load(idFrom);

  if (
    userFrom == null &&
    idFrom != "0x0000000000000000000000000000000000000000"
  ) {
    // new user
    userFrom = new User(idFrom);
    userFrom.nonce = BigInt.fromI32(0);
  }
  let fromBalance = Balance.load(`${idFrom}-${event.address.toHexString()}`);
  if (
    fromBalance == null &&
    idFrom != "0x0000000000000000000000000000000000000000"
  ) {
    // new balance
    fromBalance = new Balance(`${idFrom}-${event.address.toHexString()}`);
    fromBalance.settledBalance = BigInt.fromI32(0);
  }

  if (idFrom == "0x0000000000000000000000000000000000000000") {
    // minting tokens
    toBalance.settledBalance = toBalance.settledBalance.plus(
      event.params.value
    );
    qtoken.totalSupply = qtoken.totalSupply.plus(event.params.value);
  } else if (idTo == "0x0000000000000000000000000000000000000000") {
    // burning tokens
    fromBalance.settledBalance = fromBalance.settledBalance.minus(
      event.params.value
    );
    qtoken.totalSupply = qtoken.totalSupply.minus(event.params.value);
  } else {
    // transfering tokens
    toBalance.settledBalance = toBalance.settledBalance.plus(
      event.params.value
    );
    fromBalance.settledBalance = fromBalance.settledBalance.minus(
      event.params.value
    );
  }

  userTo.save();
  toBalance.save();
  userFrom.save();
  fromBalance.save();
  qtoken.save();
}

export function handleSettle(event: Settle): void {
  let account = event.params.account.toHexString();
  let user = User.load(account);

  if (user == null) {
    // new user
    user = new User(account);
    user.nonce = BigInt.fromI32(0);
  }
  let balance = Balance.load(`${account}-${event.address.toHexString()}`);
  if ((balance = null)) {
    // new balance
    balance = new Balance(`${account}-${event.address.toHexString()}`);
    balance.settledBalance = BigInt.fromI32(0);
  }

  balance.settledBalance = balance.settledBalance.plus(event.params.amount);

  user.save();
  balance.save();
}
