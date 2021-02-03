import { WrapperDeployed } from "../generated/TokenFactoryFacet/TokenFactory";
import { Qtoken as QtokenContract } from "../generated/templates";
import { Qtoken } from "../generated/schema";

import { BigInt } from "@graphprotocol/graph-ts";

export function handleWrapperDeployed(event: WrapperDeployed): void {
  QtokenContract.create(event.params.qToken);

  let qtoken = new Qtoken(event.params.qToken.toHexString());
  qtoken.underlyingToken = event.params.token.toHexString();
  qtoken.name = event.params.name;
  qtoken.symbol = event.params.symbol;
  qtoken.decimals = BigInt.fromI32(event.params.decimals);
  qtoken.totalSupply = BigInt.fromI32(0);

  qtoken.save();
}
