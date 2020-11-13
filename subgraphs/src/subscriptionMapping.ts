import {
  newSubscriber,
  subscriptionExecuted,
  subscriptionModified,
  contractModified
} from "../generated/templates/SubscriptionV1/SubscriptionV1";
import {
  SubscriptionFactory,
  SubscriptionContract,
  User,
  SubscriptionObj
} from "../generated/schema";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { log } from "@graphprotocol/graph-ts";

export function handleNewSubscriber(event: newSubscriber): void {
  let user = User.load(event.params.subscriber.toHexString());
  if (user == null) {
    user = new User(event.params.subscriber.toHexString());
  }
  let contract = SubscriptionContract.load(event.address.toHexString());
  if (contract == null) {
    contract = new SubscriptionContract(event.address.toHexString());
  }

  let subscription = new SubscriptionObj(
    event.params.subscriber.toHexString() + "-" + event.address.toHexString()
  );

  log.info("New Subscription {}", [subscription.id]);

  subscription.subscriber = user.id;
  subscription.contract = contract.id;
  subscription.status = "ACTIVE";
  subscription.value = event.params.value;
  subscription.paymentToken = event.params.paymentToken.toHexString();
  subscription.subNum = event.params.subNumber;
  subscription.hash = event.params.subscriptionHash;
  subscription.signedHash = event.params.signedHash;
  subscription.nextWithdraw = BigInt.fromI32(0);
  subscription.nonce = BigInt.fromI32(0);

  user.save();
  contract.save();
  subscription.save();
}

export function handleSubscriptionExecuted(event: subscriptionExecuted): void {
  let user = User.load(event.params.subscriber.toHexString());
  if (user == null) {
    user = new User(event.params.subscriber.toHexString());
  }
  let contract = SubscriptionContract.load(event.address.toHexString());
  if (contract == null) {
    contract = new SubscriptionContract(event.address.toHexString());
  }
  let subscription = SubscriptionObj.load(`${user.id}-${contract.id}`);
  if (subscription == null) {
    subscription = new SubscriptionObj(`${user.id}-${contract.id}`);
  }

  subscription.nextWithdraw = event.params.nextWithdraw;
  user.save();
  contract.save();
  subscription.save();
}

export function handleSubscriptionModified(event: subscriptionModified): void {
  let user = User.load(event.params.subscriber.toHexString());
  if (user == null) {
    user = new User(event.params.subscriber.toHexString());
  }
  let contract = SubscriptionContract.load(event.address.toHexString());
  if (contract == null) {
    contract = new SubscriptionContract(event.address.toHexString());
  }
  let subscription = SubscriptionObj.load(`${user.id}-${contract.id}`);
  if (subscription == null) {
    subscription = new SubscriptionObj(`${user.id}-${contract.id}`);
  }

  let status = event.params.status;
  if (status == 0) {
    subscription.status = "ACTIVE";
  } else if (status == 1) {
    subscription.status = "PAUSED";
  } else if (status == 2) {
    subscription.status = "CANCELLED";
  } else if (status == 3) {
    subscription.status = "EXPIRED";
  }

  subscription.value = event.params.value;
  subscription.nonce = event.params.nonce;
  subscription.hash = event.params.subscriptionHash;
  subscription.signedHash = event.params.signedHash;

  user.save();
  contract.save();
  subscription.save();
}

export function handleContractModified(event: contractModified): void {
  let contract = SubscriptionContract.load(event.address.toHexString());
  contract.publisherNonce = event.params.publisherNonce;
  contract.acceptedValues = event.params.values;

  let paymentTokens: Bytes[] = [];

  for (let i = 0, k = event.params.paymentTokens.length; i < k; i++) {
    paymentTokens.push(event.params.paymentTokens.pop());
  }

  contract.paymentTokens = paymentTokens;
  contract.save();
}
