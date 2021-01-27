// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class User extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save User entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save User entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("User", id.toString(), this);
  }

  static load(id: string): User | null {
    return store.get("User", id) as User | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get baseTokens(): Array<string> | null {
    let value = this.get("baseTokens");
    if (value === null) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set baseTokens(value: Array<string> | null) {
    if (value === null) {
      this.unset("baseTokens");
    } else {
      this.set("baseTokens", Value.fromStringArray(value as Array<string>));
    }
  }

  get subscriptions(): Array<string> | null {
    let value = this.get("subscriptions");
    if (value === null) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set subscriptions(value: Array<string> | null) {
    if (value === null) {
      this.unset("subscriptions");
    } else {
      this.set("subscriptions", Value.fromStringArray(value as Array<string>));
    }
  }

  get subscribers(): Array<string> | null {
    let value = this.get("subscribers");
    if (value === null) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set subscribers(value: Array<string> | null) {
    if (value === null) {
      this.unset("subscribers");
    } else {
      this.set("subscribers", Value.fromStringArray(value as Array<string>));
    }
  }

  get nonce(): BigInt | null {
    let value = this.get("nonce");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set nonce(value: BigInt | null) {
    if (value === null) {
      this.unset("nonce");
    } else {
      this.set("nonce", Value.fromBigInt(value as BigInt));
    }
  }

  get approved(): boolean {
    let value = this.get("approved");
    return value.toBoolean();
  }

  set approved(value: boolean) {
    this.set("approved", Value.fromBoolean(value));
  }

  get balance(): BigInt | null {
    let value = this.get("balance");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set balance(value: BigInt | null) {
    if (value === null) {
      this.unset("balance");
    } else {
      this.set("balance", Value.fromBigInt(value as BigInt));
    }
  }
}

export class BaseToken extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save BaseToken entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save BaseToken entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("BaseToken", id.toString(), this);
  }

  static load(id: string): BaseToken | null {
    return store.get("BaseToken", id) as BaseToken | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get quantity(): BigInt {
    let value = this.get("quantity");
    return value.toBigInt();
  }

  set quantity(value: BigInt) {
    this.set("quantity", Value.fromBigInt(value));
  }

  get owner(): string {
    let value = this.get("owner");
    return value.toString();
  }

  set owner(value: string) {
    this.set("owner", Value.fromString(value));
  }

  get paymentValue(): BigInt {
    let value = this.get("paymentValue");
    return value.toBigInt();
  }

  set paymentValue(value: BigInt) {
    this.set("paymentValue", Value.fromBigInt(value));
  }

  get paymentToken(): string {
    let value = this.get("paymentToken");
    return value.toString();
  }

  set paymentToken(value: string) {
    this.set("paymentToken", Value.fromString(value));
  }

  get activeTokens(): Array<string> | null {
    let value = this.get("activeTokens");
    if (value === null) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set activeTokens(value: Array<string> | null) {
    if (value === null) {
      this.unset("activeTokens");
    } else {
      this.set("activeTokens", Value.fromStringArray(value as Array<string>));
    }
  }

  get testID(): string | null {
    let value = this.get("testID");
    if (value === null) {
      return null;
    } else {
      return value.toString();
    }
  }

  set testID(value: string | null) {
    if (value === null) {
      this.unset("testID");
    } else {
      this.set("testID", Value.fromString(value as string));
    }
  }

  get txHash(): string {
    let value = this.get("txHash");
    return value.toString();
  }

  set txHash(value: string) {
    this.set("txHash", Value.fromString(value));
  }

  get index(): BigInt {
    let value = this.get("index");
    return value.toBigInt();
  }

  set index(value: BigInt) {
    this.set("index", Value.fromBigInt(value));
  }

  get initialSupply(): BigInt {
    let value = this.get("initialSupply");
    return value.toBigInt();
  }

  set initialSupply(value: BigInt) {
    this.set("initialSupply", Value.fromBigInt(value));
  }
}

export class SubscriptionToken extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save SubscriptionToken entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save SubscriptionToken entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("SubscriptionToken", id.toString(), this);
  }

  static load(id: string): SubscriptionToken | null {
    return store.get("SubscriptionToken", id) as SubscriptionToken | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get owner(): string | null {
    let value = this.get("owner");
    if (value === null) {
      return null;
    } else {
      return value.toString();
    }
  }

  set owner(value: string | null) {
    if (value === null) {
      this.unset("owner");
    } else {
      this.set("owner", Value.fromString(value as string));
    }
  }

  get creator(): string {
    let value = this.get("creator");
    return value.toString();
  }

  set creator(value: string) {
    this.set("creator", Value.fromString(value));
  }

  get nextWithdraw(): BigInt | null {
    let value = this.get("nextWithdraw");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set nextWithdraw(value: BigInt | null) {
    if (value === null) {
      this.unset("nextWithdraw");
    } else {
      this.set("nextWithdraw", Value.fromBigInt(value as BigInt));
    }
  }

  get baseToken(): string | null {
    let value = this.get("baseToken");
    if (value === null) {
      return null;
    } else {
      return value.toString();
    }
  }

  set baseToken(value: string | null) {
    if (value === null) {
      this.unset("baseToken");
    } else {
      this.set("baseToken", Value.fromString(value as string));
    }
  }

  get testID(): string | null {
    let value = this.get("testID");
    if (value === null) {
      return null;
    } else {
      return value.toString();
    }
  }

  set testID(value: string | null) {
    if (value === null) {
      this.unset("testID");
    } else {
      this.set("testID", Value.fromString(value as string));
    }
  }
}

export class NftToken extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save NftToken entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save NftToken entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("NftToken", id.toString(), this);
  }

  static load(id: string): NftToken | null {
    return store.get("NftToken", id) as NftToken | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get uri(): string {
    let value = this.get("uri");
    return value.toString();
  }

  set uri(value: string) {
    this.set("uri", Value.fromString(value));
  }

  get creator(): string {
    let value = this.get("creator");
    return value.toString();
  }

  set creator(value: string) {
    this.set("creator", Value.fromString(value));
  }

  get owner(): string {
    let value = this.get("owner");
    return value.toString();
  }

  set owner(value: string) {
    this.set("owner", Value.fromString(value));
  }

  get testID(): string | null {
    let value = this.get("testID");
    if (value === null) {
      return null;
    } else {
      return value.toString();
    }
  }

  set testID(value: string | null) {
    if (value === null) {
      this.unset("testID");
    } else {
      this.set("testID", Value.fromString(value as string));
    }
  }
}

export class Transaction extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Transaction entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Transaction entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Transaction", id.toString(), this);
  }

  static load(id: string): Transaction | null {
    return store.get("Transaction", id) as Transaction | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get from(): string | null {
    let value = this.get("from");
    if (value === null) {
      return null;
    } else {
      return value.toString();
    }
  }

  set from(value: string | null) {
    if (value === null) {
      this.unset("from");
    } else {
      this.set("from", Value.fromString(value as string));
    }
  }

  get to(): string {
    let value = this.get("to");
    return value.toString();
  }

  set to(value: string) {
    this.set("to", Value.fromString(value));
  }

  get amount(): BigInt {
    let value = this.get("amount");
    return value.toBigInt();
  }

  set amount(value: BigInt) {
    this.set("amount", Value.fromBigInt(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }
}
