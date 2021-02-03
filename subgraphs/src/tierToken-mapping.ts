import {
  TierTransfer,
  BatchTierTransfer,
} from "../generated/TierTokenFacet/TierToken";
import { ERC1155 } from "../generated/TierTokenFacet/ERC1155";

import { BigInt, store } from "@graphprotocol/graph-ts";
import { TierToken, User } from "../generated/schema";

export function handleTierTransfer(event: TierTransfer): void {
  let idTo = event.params.to.toHexString();
  let idFrom = event.params.from.toHexString();
  let contract = ERC1155.bind(event.address);
  let userTo = User.load(idTo);

  if (userTo == null && idTo != "0x0000000000000000000000000000000000000000") {
    // new user
    userTo = new User(idTo);
  }
  userTo.nonce = contract.getUserNonce(event.params.to); // lazy

  let userFrom = User.load(idFrom);

  if (
    userFrom == null &&
    idFrom != "0x0000000000000000000000000000000000000000"
  ) {
    // new user
    userFrom = new User(idFrom);
  }
  userFrom.nonce = contract.getUserNonce(event.params.from); // lazy

  let tierToken = TierToken.load(event.params.id.toString());

  if (idFrom == "0x0000000000000000000000000000000000000000") {
    // minting tokens
    tierToken = new TierToken(event.params.id.toString());
    tierToken.quantity = event.params.amount;
    tierToken.owner = idTo;
    tierToken.flowRate = event.params.flowRate;
    tierToken.paymentToken = event.params.paymentToken.toHexString();
    tierToken.initialSupply = event.params.amount;
  } else if (idTo == "0x0000000000000000000000000000000000000000") {
    // burning tokens
    tierToken.quantity = tierToken.quantity.minus(event.params.amount);

    if (
      tierToken.quantity == BigInt.fromI32(0) &&
      tierToken.activeTokens.length == 0
    ) {
      store.remove("TierToken", event.params.id.toString());
    }
  } else {
    // assumption that all tokens are transfered to new owner
    tierToken.owner = idTo;
  }

  userTo.save();
  userFrom.save();
  tierToken.save();
}

export function handleBatchTierTransfer(event: BatchTierTransfer): void {
  let idTo = event.params.to.toHexString();
  let idFrom = event.params.from.toHexString();
  let contract = ERC1155.bind(event.address);

  let userTo = User.load(idTo);

  if (userTo == null && idTo != "0x0000000000000000000000000000000000000000") {
    // new user
    userTo = new User(idTo);
  }
  userTo.nonce = contract.getUserNonce(event.params.to); // lazy

  let userFrom = User.load(idFrom);

  if (
    userFrom == null &&
    idFrom != "0x0000000000000000000000000000000000000000"
  ) {
    // new user
    userFrom = new User(idFrom);
  }
  userFrom.nonce = contract.getUserNonce(event.params.from); // lazy

  let ids = event.params.ids;
  let flowRates = event.params.flowRates;
  let amounts = event.params.amounts;
  let paymentTokens = event.params.paymentTokens;
  for (var i = 0; i < ids.length; i++) {
    let tierToken = TierToken.load(ids[i].toString());
    if (idFrom == "0x0000000000000000000000000000000000000000") {
      // minting tokens
      tierToken = new TierToken(ids[i].toString());
      tierToken.quantity = amounts[i];
      tierToken.owner = idTo;
      tierToken.flowRate = flowRates[i];
      tierToken.paymentToken = paymentTokens[i].toHexString();
      tierToken.initialSupply = amounts[i];
    } else if (idTo == "0x0000000000000000000000000000000000000000") {
      // burning tokens
      tierToken.quantity = tierToken.quantity.minus(amounts[i]);
      if (
        tierToken.quantity == BigInt.fromI32(0) &&
        tierToken.activeTokens.length == 0
      ) {
        store.remove("TierToken", ids[i].toString());
      }
    } else {
      // assumption that all tokens are transfered to new owner
      tierToken.owner = idTo;
    }

    tierToken.save();
  }

  userTo.save();
  userFrom.save();
}
