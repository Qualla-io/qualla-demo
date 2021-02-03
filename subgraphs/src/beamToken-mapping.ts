import {
  FlowUpdated,
  BeamTransfer,
} from "../generated/BeamTokenFacet/BeamToken";

import { BigInt, store } from "@graphprotocol/graph-ts";
import { Balance, BeamToken, TierToken, User } from "../generated/schema";

export function handleFlowUpdated(event: FlowUpdated): void {
  let account = event.params.account.toHexString();
  let tokenId = event.params.token.toHexString();

  let user = User.load(account);

  if (user == null) {
    // new user
    user = new User(account);
    user.nonce = BigInt.fromI32(0);
  }

  let balance = Balance.load(`${account}-${tokenId}`);
  if (balance == null) {
    // new user
    balance = new Balance(`${account}-${tokenId}`);
  }

  balance.netFlowrate = event.params.netFlow;
  balance.netDeposit = event.params.netDeposit;
  balance.lastUpdated = event.params.timestamp;

  user.save();
  balance.save();
}

export function handleBeamTransfer(event: BeamTransfer): void {
  let idTo = event.params.to.toHexString();
  let idFrom = event.params.from.toHexString();

  let userTo = User.load(idTo);

  if (userTo == null && idTo != "0x0000000000000000000000000000000000000000") {
    // new user
    userTo = new User(idTo);
    userTo.nonce = BigInt.fromI32(0);
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

  let beamToken = BeamToken.load(event.params.id.toString());

  if (idFrom == "0x0000000000000000000000000000000000000000") {
    // minting tokens
    beamToken = new BeamToken(event.params.id.toString());
    let tierToken = TierToken.load(event.params.tierId.toString());

    beamToken.owner = idTo;
    beamToken.creator = tierToken.owner;
    beamToken.flowRate = event.params.flowRate;
    beamToken.deposit = event.params.deposit;
    beamToken.tierToken = event.params.tierId.toString();
    beamToken.paymentToken = tierToken.paymentToken;
    beamToken.mintStamp - event.params.timestamp;
  } else if (idTo == "0x0000000000000000000000000000000000000000") {
    // burning tokens

    // maybe just set owner equal to zero address?
    store.remove("BeamToken", event.params.id.toString());
  } else {
    // transfering tokens
    beamToken.owner = idTo;
    beamToken.flowRate = event.params.flowRate;
    beamToken.deposit = event.params.deposit;
  }

  beamToken.save();
  userTo.save();
  userFrom.save();
}
