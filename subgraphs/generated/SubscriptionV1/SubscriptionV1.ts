// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class ApprovalForAll extends ethereum.Event {
  get params(): ApprovalForAll__Params {
    return new ApprovalForAll__Params(this);
  }
}

export class ApprovalForAll__Params {
  _event: ApprovalForAll;

  constructor(event: ApprovalForAll) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get operator(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get approved(): boolean {
    return this._event.parameters[2].value.toBoolean();
  }
}

export class NFTevent extends ethereum.Event {
  get params(): NFTevent__Params {
    return new NFTevent__Params(this);
  }
}

export class NFTevent__Params {
  _event: NFTevent;

  constructor(event: NFTevent) {
    this._event = event;
  }

  get id(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class TransferBatch extends ethereum.Event {
  get params(): TransferBatch__Params {
    return new TransferBatch__Params(this);
  }
}

export class TransferBatch__Params {
  _event: TransferBatch;

  constructor(event: TransferBatch) {
    this._event = event;
  }

  get operator(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get from(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get to(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get ids(): Array<BigInt> {
    return this._event.parameters[3].value.toBigIntArray();
  }

  get values(): Array<BigInt> {
    return this._event.parameters[4].value.toBigIntArray();
  }
}

export class TransferSingle extends ethereum.Event {
  get params(): TransferSingle__Params {
    return new TransferSingle__Params(this);
  }
}

export class TransferSingle__Params {
  _event: TransferSingle;

  constructor(event: TransferSingle) {
    this._event = event;
  }

  get operator(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get from(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get to(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get id(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get value(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }
}

export class URI extends ethereum.Event {
  get params(): URI__Params {
    return new URI__Params(this);
  }
}

export class URI__Params {
  _event: URI;

  constructor(event: URI) {
    this._event = event;
  }

  get value(): string {
    return this._event.parameters[0].value.toString();
  }

  get id(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class SubscriptionV1 extends ethereum.SmartContract {
  static bind(address: Address): SubscriptionV1 {
    return new SubscriptionV1("SubscriptionV1", address);
  }

  DOMAIN_SEPARATOR(): Bytes {
    let result = super.call(
      "DOMAIN_SEPARATOR",
      "DOMAIN_SEPARATOR():(bytes32)",
      []
    );

    return result[0].toBytes();
  }

  try_DOMAIN_SEPARATOR(): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "DOMAIN_SEPARATOR",
      "DOMAIN_SEPARATOR():(bytes32)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  USER_TYPEHASH(): Bytes {
    let result = super.call("USER_TYPEHASH", "USER_TYPEHASH():(bytes32)", []);

    return result[0].toBytes();
  }

  try_USER_TYPEHASH(): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "USER_TYPEHASH",
      "USER_TYPEHASH():(bytes32)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  balanceOf(account: Address, id: BigInt): BigInt {
    let result = super.call(
      "balanceOf",
      "balanceOf(address,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(account),
        ethereum.Value.fromUnsignedBigInt(id)
      ]
    );

    return result[0].toBigInt();
  }

  try_balanceOf(account: Address, id: BigInt): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "balanceOf",
      "balanceOf(address,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(account),
        ethereum.Value.fromUnsignedBigInt(id)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  balanceOfBatch(accounts: Array<Address>, ids: Array<BigInt>): Array<BigInt> {
    let result = super.call(
      "balanceOfBatch",
      "balanceOfBatch(address[],uint256[]):(uint256[])",
      [
        ethereum.Value.fromAddressArray(accounts),
        ethereum.Value.fromUnsignedBigIntArray(ids)
      ]
    );

    return result[0].toBigIntArray();
  }

  try_balanceOfBatch(
    accounts: Array<Address>,
    ids: Array<BigInt>
  ): ethereum.CallResult<Array<BigInt>> {
    let result = super.tryCall(
      "balanceOfBatch",
      "balanceOfBatch(address[],uint256[]):(uint256[])",
      [
        ethereum.Value.fromAddressArray(accounts),
        ethereum.Value.fromUnsignedBigIntArray(ids)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigIntArray());
  }

  chainId(): BigInt {
    let result = super.call("chainId", "chainId():(uint256)", []);

    return result[0].toBigInt();
  }

  try_chainId(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("chainId", "chainId():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getBaseIdFromToken(id_: BigInt): BigInt {
    let result = super.call(
      "getBaseIdFromToken",
      "getBaseIdFromToken(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(id_)]
    );

    return result[0].toBigInt();
  }

  try_getBaseIdFromToken(id_: BigInt): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getBaseIdFromToken",
      "getBaseIdFromToken(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(id_)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  isApprovedForAll(account: Address, operator: Address): boolean {
    let result = super.call(
      "isApprovedForAll",
      "isApprovedForAll(address,address):(bool)",
      [
        ethereum.Value.fromAddress(account),
        ethereum.Value.fromAddress(operator)
      ]
    );

    return result[0].toBoolean();
  }

  try_isApprovedForAll(
    account: Address,
    operator: Address
  ): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "isApprovedForAll",
      "isApprovedForAll(address,address):(bool)",
      [
        ethereum.Value.fromAddress(account),
        ethereum.Value.fromAddress(operator)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  name(): string {
    let result = super.call("name", "name():(string)", []);

    return result[0].toString();
  }

  try_name(): ethereum.CallResult<string> {
    let result = super.tryCall("name", "name():(string)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }

  supportsInterface(interfaceId: Bytes): boolean {
    let result = super.call(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(interfaceId)]
    );

    return result[0].toBoolean();
  }

  try_supportsInterface(interfaceId: Bytes): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(interfaceId)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  tokenIdToCreator(param0: BigInt): Address {
    let result = super.call(
      "tokenIdToCreator",
      "tokenIdToCreator(uint256):(address)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );

    return result[0].toAddress();
  }

  try_tokenIdToCreator(param0: BigInt): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "tokenIdToCreator",
      "tokenIdToCreator(uint256):(address)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  tokenIdToNextIndex(param0: BigInt): BigInt {
    let result = super.call(
      "tokenIdToNextIndex",
      "tokenIdToNextIndex(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );

    return result[0].toBigInt();
  }

  try_tokenIdToNextIndex(param0: BigInt): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "tokenIdToNextIndex",
      "tokenIdToNextIndex(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  tokenIdToPaymentToken(param0: BigInt): Address {
    let result = super.call(
      "tokenIdToPaymentToken",
      "tokenIdToPaymentToken(uint256):(address)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );

    return result[0].toAddress();
  }

  try_tokenIdToPaymentToken(param0: BigInt): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "tokenIdToPaymentToken",
      "tokenIdToPaymentToken(uint256):(address)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  tokenIdToPaymentValue(param0: BigInt): BigInt {
    let result = super.call(
      "tokenIdToPaymentValue",
      "tokenIdToPaymentValue(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );

    return result[0].toBigInt();
  }

  try_tokenIdToPaymentValue(param0: BigInt): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "tokenIdToPaymentValue",
      "tokenIdToPaymentValue(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  tokenId_ToNextWithdraw(param0: BigInt): BigInt {
    let result = super.call(
      "tokenId_ToNextWithdraw",
      "tokenId_ToNextWithdraw(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );

    return result[0].toBigInt();
  }

  try_tokenId_ToNextWithdraw(param0: BigInt): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "tokenId_ToNextWithdraw",
      "tokenId_ToNextWithdraw(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  tokenNonce(): BigInt {
    let result = super.call("tokenNonce", "tokenNonce():(uint256)", []);

    return result[0].toBigInt();
  }

  try_tokenNonce(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("tokenNonce", "tokenNonce():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  uri(param0: BigInt): string {
    let result = super.call("uri", "uri(uint256):(string)", [
      ethereum.Value.fromUnsignedBigInt(param0)
    ]);

    return result[0].toString();
  }

  try_uri(param0: BigInt): ethereum.CallResult<string> {
    let result = super.tryCall("uri", "uri(uint256):(string)", [
      ethereum.Value.fromUnsignedBigInt(param0)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }

  userNonce(param0: Address): BigInt {
    let result = super.call("userNonce", "userNonce(address):(uint256)", [
      ethereum.Value.fromAddress(param0)
    ]);

    return result[0].toBigInt();
  }

  try_userNonce(param0: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall("userNonce", "userNonce(address):(uint256)", [
      ethereum.Value.fromAddress(param0)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  version(): string {
    let result = super.call("version", "version():(string)", []);

    return result[0].toString();
  }

  try_version(): ethereum.CallResult<string> {
    let result = super.tryCall("version", "version():(string)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class BuySubscriptionCall extends ethereum.Call {
  get inputs(): BuySubscriptionCall__Inputs {
    return new BuySubscriptionCall__Inputs(this);
  }

  get outputs(): BuySubscriptionCall__Outputs {
    return new BuySubscriptionCall__Outputs(this);
  }
}

export class BuySubscriptionCall__Inputs {
  _call: BuySubscriptionCall;

  constructor(call: BuySubscriptionCall) {
    this._call = call;
  }

  get subscriber(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get id(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get v(): i32 {
    return this._call.inputValues[2].value.toI32();
  }

  get r(): Bytes {
    return this._call.inputValues[3].value.toBytes();
  }

  get s(): Bytes {
    return this._call.inputValues[4].value.toBytes();
  }
}

export class BuySubscriptionCall__Outputs {
  _call: BuySubscriptionCall;

  constructor(call: BuySubscriptionCall) {
    this._call = call;
  }
}

export class ExecuteSubscriptionCall extends ethereum.Call {
  get inputs(): ExecuteSubscriptionCall__Inputs {
    return new ExecuteSubscriptionCall__Inputs(this);
  }

  get outputs(): ExecuteSubscriptionCall__Outputs {
    return new ExecuteSubscriptionCall__Outputs(this);
  }
}

export class ExecuteSubscriptionCall__Inputs {
  _call: ExecuteSubscriptionCall;

  constructor(call: ExecuteSubscriptionCall) {
    this._call = call;
  }

  get id_(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get subscriber(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class ExecuteSubscriptionCall__Outputs {
  _call: ExecuteSubscriptionCall;

  constructor(call: ExecuteSubscriptionCall) {
    this._call = call;
  }
}

export class MintBatchSubscriptionCall extends ethereum.Call {
  get inputs(): MintBatchSubscriptionCall__Inputs {
    return new MintBatchSubscriptionCall__Inputs(this);
  }

  get outputs(): MintBatchSubscriptionCall__Outputs {
    return new MintBatchSubscriptionCall__Outputs(this);
  }
}

export class MintBatchSubscriptionCall__Inputs {
  _call: MintBatchSubscriptionCall;

  constructor(call: MintBatchSubscriptionCall) {
    this._call = call;
  }

  get creator(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get amounts(): Array<BigInt> {
    return this._call.inputValues[1].value.toBigIntArray();
  }

  get v(): i32 {
    return this._call.inputValues[2].value.toI32();
  }

  get r(): Bytes {
    return this._call.inputValues[3].value.toBytes();
  }

  get s(): Bytes {
    return this._call.inputValues[4].value.toBytes();
  }

  get data(): Bytes {
    return this._call.inputValues[5].value.toBytes();
  }
}

export class MintBatchSubscriptionCall__Outputs {
  _call: MintBatchSubscriptionCall;

  constructor(call: MintBatchSubscriptionCall) {
    this._call = call;
  }
}

export class MintNFTCall extends ethereum.Call {
  get inputs(): MintNFTCall__Inputs {
    return new MintNFTCall__Inputs(this);
  }

  get outputs(): MintNFTCall__Outputs {
    return new MintNFTCall__Outputs(this);
  }
}

export class MintNFTCall__Inputs {
  _call: MintNFTCall;

  constructor(call: MintNFTCall) {
    this._call = call;
  }
}

export class MintNFTCall__Outputs {
  _call: MintNFTCall;

  constructor(call: MintNFTCall) {
    this._call = call;
  }
}

export class MintSubscriptionCall extends ethereum.Call {
  get inputs(): MintSubscriptionCall__Inputs {
    return new MintSubscriptionCall__Inputs(this);
  }

  get outputs(): MintSubscriptionCall__Outputs {
    return new MintSubscriptionCall__Outputs(this);
  }
}

export class MintSubscriptionCall__Inputs {
  _call: MintSubscriptionCall;

  constructor(call: MintSubscriptionCall) {
    this._call = call;
  }

  get creator(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get v(): i32 {
    return this._call.inputValues[2].value.toI32();
  }

  get r(): Bytes {
    return this._call.inputValues[3].value.toBytes();
  }

  get s(): Bytes {
    return this._call.inputValues[4].value.toBytes();
  }

  get data(): Bytes {
    return this._call.inputValues[5].value.toBytes();
  }
}

export class MintSubscriptionCall__Outputs {
  _call: MintSubscriptionCall;

  constructor(call: MintSubscriptionCall) {
    this._call = call;
  }
}

export class SafeBatchTransferFromCall extends ethereum.Call {
  get inputs(): SafeBatchTransferFromCall__Inputs {
    return new SafeBatchTransferFromCall__Inputs(this);
  }

  get outputs(): SafeBatchTransferFromCall__Outputs {
    return new SafeBatchTransferFromCall__Outputs(this);
  }
}

export class SafeBatchTransferFromCall__Inputs {
  _call: SafeBatchTransferFromCall;

  constructor(call: SafeBatchTransferFromCall) {
    this._call = call;
  }

  get from(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get to(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get ids(): Array<BigInt> {
    return this._call.inputValues[2].value.toBigIntArray();
  }

  get amounts(): Array<BigInt> {
    return this._call.inputValues[3].value.toBigIntArray();
  }

  get data(): Bytes {
    return this._call.inputValues[4].value.toBytes();
  }
}

export class SafeBatchTransferFromCall__Outputs {
  _call: SafeBatchTransferFromCall;

  constructor(call: SafeBatchTransferFromCall) {
    this._call = call;
  }
}

export class SafeTransferFromCall extends ethereum.Call {
  get inputs(): SafeTransferFromCall__Inputs {
    return new SafeTransferFromCall__Inputs(this);
  }

  get outputs(): SafeTransferFromCall__Outputs {
    return new SafeTransferFromCall__Outputs(this);
  }
}

export class SafeTransferFromCall__Inputs {
  _call: SafeTransferFromCall;

  constructor(call: SafeTransferFromCall) {
    this._call = call;
  }

  get from(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get to(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get id(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get amount(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }

  get data(): Bytes {
    return this._call.inputValues[4].value.toBytes();
  }
}

export class SafeTransferFromCall__Outputs {
  _call: SafeTransferFromCall;

  constructor(call: SafeTransferFromCall) {
    this._call = call;
  }
}

export class SetApprovalForAllCall extends ethereum.Call {
  get inputs(): SetApprovalForAllCall__Inputs {
    return new SetApprovalForAllCall__Inputs(this);
  }

  get outputs(): SetApprovalForAllCall__Outputs {
    return new SetApprovalForAllCall__Outputs(this);
  }
}

export class SetApprovalForAllCall__Inputs {
  _call: SetApprovalForAllCall;

  constructor(call: SetApprovalForAllCall) {
    this._call = call;
  }

  get operator(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get approved(): boolean {
    return this._call.inputValues[1].value.toBoolean();
  }
}

export class SetApprovalForAllCall__Outputs {
  _call: SetApprovalForAllCall;

  constructor(call: SetApprovalForAllCall) {
    this._call = call;
  }
}

export class UnSubscribeCall extends ethereum.Call {
  get inputs(): UnSubscribeCall__Inputs {
    return new UnSubscribeCall__Inputs(this);
  }

  get outputs(): UnSubscribeCall__Outputs {
    return new UnSubscribeCall__Outputs(this);
  }
}

export class UnSubscribeCall__Inputs {
  _call: UnSubscribeCall;

  constructor(call: UnSubscribeCall) {
    this._call = call;
  }

  get subscriber(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get id_(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get v(): i32 {
    return this._call.inputValues[2].value.toI32();
  }

  get r(): Bytes {
    return this._call.inputValues[3].value.toBytes();
  }

  get s(): Bytes {
    return this._call.inputValues[4].value.toBytes();
  }
}

export class UnSubscribeCall__Outputs {
  _call: UnSubscribeCall;

  constructor(call: UnSubscribeCall) {
    this._call = call;
  }
}

export class UpdateSubscriptionCreatorCall extends ethereum.Call {
  get inputs(): UpdateSubscriptionCreatorCall__Inputs {
    return new UpdateSubscriptionCreatorCall__Inputs(this);
  }

  get outputs(): UpdateSubscriptionCreatorCall__Outputs {
    return new UpdateSubscriptionCreatorCall__Outputs(this);
  }
}

export class UpdateSubscriptionCreatorCall__Inputs {
  _call: UpdateSubscriptionCreatorCall;

  constructor(call: UpdateSubscriptionCreatorCall) {
    this._call = call;
  }

  get newCreator(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get id(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get v(): i32 {
    return this._call.inputValues[2].value.toI32();
  }

  get r(): Bytes {
    return this._call.inputValues[3].value.toBytes();
  }

  get s(): Bytes {
    return this._call.inputValues[4].value.toBytes();
  }
}

export class UpdateSubscriptionCreatorCall__Outputs {
  _call: UpdateSubscriptionCreatorCall;

  constructor(call: UpdateSubscriptionCreatorCall) {
    this._call = call;
  }
}