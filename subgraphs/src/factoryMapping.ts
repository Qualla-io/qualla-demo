import {
  subscriptionCreated,
  factoryModified
} from "../generated/SubscriptionFactory/SubscriptionFactory";
import {
  SubscriptionFactory,
  SubscriptionContract,
  User
} from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleSubscriptionCreated(event: subscriptionCreated): void {
  let id = event.params.publisher.toHexString();

  let user = User.load(event.params.publisher.toHexString());

  if (user == null) {
    user = new User(event.params.publisher.toHexString());
  }

  let contract = new SubscriptionContract(
    event.params.subscription.toHexString()
  );

  contract.publisher = user.id;
  user.contract = contract.id;
  var tokenString: string[];
  event.params.paymentTokens.forEach(function(token) {
    tokenString.push(token.toHexString());
  });

  contract.paymentTokens = tokenString;
  contract.acceptedValues = event.params.acceptedValues;
  contract.publisherNonce = new BigInt(0);
  contract.factory = event.address.toHexString();
  contract.save();
  user.save();

  // Creat new contract from template
  // let context = new DataSourceContext();
  // SubscriptionV1.create(event.params.subscription);
}

export function handleFactoryModified(event: factoryModified): void {
  // let id = event.params.id.toHex();
  let id = event.address.toHexString();
  let factory = SubscriptionFactory.load(id);
  if (factory == null) {
    factory = new SubscriptionFactory(id);
  }
  factory.master = event.params.master.toHexString();
  factory.fee = event.params.fee;
  factory.save();
}
