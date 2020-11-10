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
  let user = User.load(event.params.publisher.toHexString());

  if (user == null) {
    user = new User(event.params.publisher.toHexString());
  }

  let factory = SubscriptionFactory.load(event.address.toHexString());

  if (factory == null) {
    factory = new SubscriptionFactory(event.address.toHexString());
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
  contract.publisherNonce = BigInt.fromI32(0);
  contract.factory = factory.id;
  contract.save();
  user.save();
  factory.save();

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
