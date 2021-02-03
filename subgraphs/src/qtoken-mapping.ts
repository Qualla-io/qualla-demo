import { Balance, User } from "../generated/schema";
import { Transfer, Settle } from "../generated/templates/Qtoken/Qtoken";

import { BigInt } from "@graphprotocol/graph-ts";
import { Qtoken } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  let idTo = event.params.to.toHexString();
  let idFrom = event.params.from.toHexString();
  let qtoken = Qtoken.load(event.address.toHexString());

  let userTo = User.load(idTo);

  if (userTo == null) {
    // new user
    userTo = new User(idTo);
    userTo.nonce = BigInt.fromI32(0);
  }
  let toBalanceID = idTo + `-` + event.address.toHexString();

  let toBalance = Balance.load(toBalanceID);
  if (toBalance == null) {
    // new balance
    toBalance = new Balance(toBalanceID);
    toBalance.settledBalance = BigInt.fromI32(0);
    toBalance.qtoken = event.address.toHexString();
    toBalance.user = idTo;
    toBalance.netFlowrate = BigInt.fromI32(0);
    toBalance.netDeposit = BigInt.fromI32(0);
    toBalance.lastUpdated = event.block.timestamp;
  }

  let userFrom = User.load(idFrom);

  if (userFrom == null) {
    // new user
    userFrom = new User(idFrom);
    userFrom.nonce = BigInt.fromI32(0);
  }

  let fromBalanceID = idFrom + `-` + event.address.toHexString();
  let fromBalance = Balance.load(fromBalanceID);
  if (fromBalance == null) {
    // new balance
    fromBalance = new Balance(fromBalanceID);
    fromBalance.settledBalance = BigInt.fromI32(0);
    fromBalance.qtoken = event.address.toHexString();
    fromBalance.user = idFrom;
    fromBalance.netFlowrate = BigInt.fromI32(0);
    fromBalance.netDeposit = BigInt.fromI32(0);
    fromBalance.lastUpdated = event.block.timestamp;
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

  let balanceId = account + `-` + event.address.toHexString();
  let balance = Balance.load(balanceId);
  if (balance == null) {
    // new balance
    balance = new Balance(balanceId);
    balance.settledBalance = BigInt.fromI32(0);
    balance.qtoken = event.address.toHexString();
    balance.user = account;
    balance.netFlowrate = BigInt.fromI32(0);
    balance.netDeposit = BigInt.fromI32(0);
    balance.lastUpdated = event.block.timestamp;
  }

  balance.settledBalance = balance.settledBalance.plus(event.params.amount);

  user.save();
  balance.save();
}
