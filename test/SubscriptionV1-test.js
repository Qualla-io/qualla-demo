const { expect } = require("chai");
const { ethers } = require("hardhat");

const { shouldThrow } = require("./utils");

describe("Subscription Contract", function () {
  let domain;
  let alice;
  let bob;
  let charlie;
  let creatorTypes;
  let _wallet;
  let _walletCharlie;
  let abiCoder = ethers.utils.defaultAbiCoder;

  let subscriptionV1;
  let testDai;

  beforeEach(async () => {
    let SubscriptionV1 = await ethers.getContractFactory("SubscriptionV1");
    subscriptionV1 = await SubscriptionV1.deploy();

    let TestDai = await ethers.getContractFactory("TestDai");
    testDai = await TestDai.deploy(31337);

    domain = {
      name: "Qualla Subscription",
      version: "1",
      chainId: 31337,
      verifyingContract: subscriptionV1.address,
    };

    creatorTypes = {
      User: [
        { name: "user", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "action", type: "string" },
      ],
    };

    [alice, bob, charlie] = await ethers.getSigners();

    await testDai.mintTokens(bob.address, 1000);
    await testDai.mintTokens(charlie.address, 1000);

    let _testDai = await testDai.connect(charlie);

    await _testDai.approve(subscriptionV1.address, 100);

    // Wallet for bob to sign typed data
    _wallet = new ethers.Wallet(
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
    );

    _walletCharlie = new ethers.Wallet(
      "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
    );
  });

  context("With checking utils", async () => {
    xit("Should reject signature with wrong nonce", async () => {});
    xit("Should reject signature with wrong address", async () => {});
  });

  context("With minting subscription", async () => {
    it("Should mint new base subscription token", async () => {
      let data = abiCoder.encode(
        ["address[]", "uint256[]"],
        [[testDai.address], [10]]
      );

      const creatorData = {
        user: bob.address,
        nonce: 0,
        action: "mint",
      };

      let signature = await _wallet._signTypedData(
        domain,
        creatorTypes,
        creatorData
      );

      signature = ethers.utils.splitSignature(signature);

      await subscriptionV1.mintSubscription(
        bob.address,
        0,
        signature.v,
        signature.r,
        signature.s,
        data
      );

      let paymentToken = await subscriptionV1.tokenIdToPaymentToken(
        "340282366920938463463374607431768211456" // Token 1 id
      );

      let paymentValue = await subscriptionV1.tokenIdToPaymentValue(
        "340282366920938463463374607431768211456"
      );

      expect(paymentToken).to.equal(testDai.address);
      expect(paymentValue.toString()).to.equal("10");

      const bal = await subscriptionV1.balanceOf(
        bob.address,
        "340282366920938463463374607431768211456"
      );

      expect(bal.toString()).to.equal(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      );
    });

    it("Should mint new subscription index token", async () => {
      let data = abiCoder.encode(
        ["address[]", "uint256[]"],
        [[testDai.address], [10]]
      );

      let creatorData = {
        user: bob.address,
        nonce: 0,
        action: "mint",
      };

      let signature = await _wallet._signTypedData(
        domain,
        creatorTypes,
        creatorData
      );

      signature = ethers.utils.splitSignature(signature);

      await subscriptionV1.mintSubscription(
        bob.address,
        0,
        signature.v,
        signature.r,
        signature.s,
        data
      );

      //   User subscribing
      let subscriberData = {
        user: charlie.address,
        nonce: 0,
        action: "subscribe",
      };

      signature = await _walletCharlie._signTypedData(
        domain,
        creatorTypes,
        subscriberData
      );

      signature = ethers.utils.splitSignature(signature);

      await subscriptionV1.buySubscription(
        charlie.address,
        "340282366920938463463374607431768211456", //stru.id,
        signature.v,
        signature.r,
        signature.s
      );

      let bal = await subscriptionV1.balanceOf(
        charlie.address,
        "340282366920938463463374607431768211457"
      );

      expect(bal.toString()).to.equal("1");

      bal = await subscriptionV1.balanceOf(
        bob.address,
        "340282366920938463463374607431768211456"
      );

      expect(bal.toString()).to.equal(
        "115792089237316195423570985008687907853269984665640564039457584007913129639934"
      );
    });

    it("Should burn subscription index token when unsubscribed", async () => {
      let data = abiCoder.encode(
        ["address[]", "uint256[]"],
        [[testDai.address], [10]]
      );

      let creatorData = {
        user: bob.address,
        nonce: 0,
        action: "mint",
      };

      let signature = await _wallet._signTypedData(
        domain,
        creatorTypes,
        creatorData
      );

      signature = ethers.utils.splitSignature(signature);

      await subscriptionV1.mintSubscription(
        bob.address,
        0,
        signature.v,
        signature.r,
        signature.s,
        data
      );

      //   User subscribing
      let subscriberData = {
        user: charlie.address,
        nonce: 0,
        action: "subscribe",
      };

      signature = await _walletCharlie._signTypedData(
        domain,
        creatorTypes,
        subscriberData
      );

      signature = ethers.utils.splitSignature(signature);

      await subscriptionV1.buySubscription(
        charlie.address,
        "340282366920938463463374607431768211456", //stru.id,
        signature.v,
        signature.r,
        signature.s
      );

      // Unsubscribe

      subscriberData = {
        user: charlie.address,
        nonce: 1,
        action: "unsubscribe",
      };

      signature = await _walletCharlie._signTypedData(
        domain,
        creatorTypes,
        subscriberData
      );

      signature = ethers.utils.splitSignature(signature);

      await subscriptionV1.unSubscribe(
        charlie.address,
        "340282366920938463463374607431768211457",
        signature.v,
        signature.r,
        signature.s
      );

      let bal = await subscriptionV1.balanceOf(
        charlie.address,
        "340282366920938463463374607431768211457"
      );

      expect(bal.toString()).to.equal("0");

      bal = await subscriptionV1.balanceOf(
        bob.address,
        "340282366920938463463374607431768211456"
      );

      expect(bal.toString()).to.equal(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      );
    });

    it("Should execute subscription and update nextWidthdraw", async () => {
      let initBal = await testDai.balanceOf(bob.address);

      let data = abiCoder.encode(
        ["address[]", "uint256[]"],
        [[testDai.address], [100]]
      );

      let creatorData = {
        user: bob.address,
        nonce: 0,
        action: "mint",
      };

      let signature = await _wallet._signTypedData(
        domain,
        creatorTypes,
        creatorData
      );

      signature = ethers.utils.splitSignature(signature);

      await subscriptionV1.mintSubscription(
        bob.address,
        0,
        signature.v,
        signature.r,
        signature.s,
        data
      );

      //   User subscribing
      let subscriberData = {
        user: charlie.address,
        nonce: 0,
        action: "subscribe",
      };

      signature = await _walletCharlie._signTypedData(
        domain,
        creatorTypes,
        subscriberData
      );

      signature = ethers.utils.splitSignature(signature);

      await subscriptionV1.buySubscription(
        charlie.address,
        "340282366920938463463374607431768211456", //stru.id,
        signature.v,
        signature.r,
        signature.s
      );

      // let initNextWidth = await subscriptionV1.tokenId_ToNextWithdraw(
      //   "340282366920938463463374607431768211457"
      // );

      // await subscriptionV1.executeSubscription(
      //   "340282366920938463463374607431768211457",
      //   charlie.address
      // );

      let nextWidth = await subscriptionV1.tokenId_ToNextWithdraw(
        "340282366920938463463374607431768211457"
      );

      let bal = await testDai.balanceOf(bob.address);

      expect(bal.toString()).to.equal(initBal.add(95).toString());

      bal = await testDai.balanceOf(alice.address);

      expect(bal.toString()).to.equal("5");

      expect(parseInt(nextWidth)).to.be.greaterThan(0);
    });

    it("Should mint a batch of new base subscription tokens", async () => {
      let data = abiCoder.encode(
        ["address[]", "uint256[]"],
        [
          [testDai.address, testDai.address, testDai.address],
          [10, 20, 30],
        ]
      );

      let creatorData = {
        user: bob.address,
        nonce: 0,
        action: "mint",
      };

      let signature = await _wallet._signTypedData(
        domain,
        creatorTypes,
        creatorData
      );

      signature = ethers.utils.splitSignature(signature);

      await subscriptionV1.mintBatchSubscription(
        bob.address,
        [0, 0, 0],
        signature.v,
        signature.r,
        signature.s,
        data
      );

      let paymentToken = await subscriptionV1.tokenIdToPaymentToken(
        "1020847100762815390390123822295304634368" // Token 3 id
      );

      let paymentValue = await subscriptionV1.tokenIdToPaymentValue(
        "1020847100762815390390123822295304634368"
      );

      expect(paymentToken).to.equal(testDai.address);
      expect(paymentValue.toString()).to.equal("30");

      const bal = await subscriptionV1.balanceOf(
        bob.address,
        "1020847100762815390390123822295304634368"
      );

      expect(bal.toString()).to.equal(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      );
    });
  });
});
