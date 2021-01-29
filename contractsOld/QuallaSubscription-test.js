const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Qualla Base Contract", function () {
  let chainId = 31337;
  let domain;
  let types;
  let alice;
  let bob;
  let charlie;
  let daniel;
  let quallaSub;
  let _walletBob;
  let _walletCharlie;

  beforeEach(async () => {
    let QuallaSub = await ethers.getContractFactory("QuallaSubscription");
    quallaSub = await QuallaSub.deploy("URI_TEST", chainId);

    let TestDai = await ethers.getContractFactory("TestDai");
    testDai = await TestDai.deploy(31337);

    domain = {
      name: "Qualla Subscription",
      version: "1",
      chainId: 31337,
      verifyingContract: quallaSub.address,
    };

    types = {
      User: [
        { name: "user", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "action", type: "string" },
      ],
    };

    [alice, bob, charlie, daniel] = await ethers.getSigners();

    _walletBob = new ethers.Wallet(
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
    );

    _walletCharlie = new ethers.Wallet(
      "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
    );

    let _testDai = await testDai.connect(bob);
    await _testDai.approve(quallaSub.address, 1000);
  });

  context("With minting subscriptions", async () => {
    it("Should mint new baseToken", async () => {
      const data = {
        user: charlie.address,
        nonce: 0,
        action: "mint",
      };

      let signature = await _walletCharlie._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await quallaSub.mintSubscription(
        charlie.address,
        0,
        testDai.address,
        10,
        signature.v,
        signature.r,
        signature.s
      );

      let paymentToken = await quallaSub.tokenIdToPaymentToken(
        "340282366920938463463374607431768211456" // Token 1 id
      );

      let paymentValue = await quallaSub.tokenIdToPaymentValue(
        "340282366920938463463374607431768211456"
      );

      expect(paymentToken).to.equal(testDai.address);
      expect(paymentValue.toString()).to.equal("10");

      const bal = await quallaSub.balanceOf(
        charlie.address,
        "340282366920938463463374607431768211456"
      );

      expect(bal.toString()).to.equal(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      );
    });

    it("Should mint batch of baseTokens", async () => {
      let paymentTokens = [testDai.address, testDai.address, testDai.address];
      let paymentValues = [10, 20, 30];

      let data = {
        user: charlie.address,
        nonce: 0,
        action: "mint",
      };

      let signature = await _walletCharlie._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await quallaSub.mintBatchSubscription(
        charlie.address,
        [0, 0, 0],
        paymentTokens,
        paymentValues,
        signature.v,
        signature.r,
        signature.s
      );

      let paymentToken = await quallaSub.tokenIdToPaymentToken(
        "1020847100762815390390123822295304634368" // Token 3 id
      );

      let paymentValue = await quallaSub.tokenIdToPaymentValue(
        "1020847100762815390390123822295304634368"
      );

      expect(paymentToken).to.equal(testDai.address);
      expect(paymentValue.toString()).to.equal("30");

      const bal = await quallaSub.balanceOf(
        charlie.address,
        "1020847100762815390390123822295304634368"
      );

      expect(bal.toString()).to.equal(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      );
    });

    it("Should mint new of subToken from baseToken when bought", async () => {
      let data = {
        user: charlie.address,
        nonce: 0,
        action: "mint",
      };

      let signature = await _walletCharlie._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await quallaSub.mintSubscription(
        charlie.address,
        2,
        testDai.address,
        10,
        signature.v,
        signature.r,
        signature.s
      );

      data = {
        user: bob.address,
        nonce: 0,
        action: "subscribe",
      };

      signature = await _walletBob._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await quallaSub.buySubscription(
        bob.address,
        "340282366920938463463374607431768211456",
        signature.v,
        signature.r,
        signature.s
      );

      let bal = await quallaSub.balanceOf(
        bob.address,
        "340282366920938463463374607431768211457"
      );

      expect(bal.toString()).to.equal("1");

      bal = await quallaSub.balanceOf(
        charlie.address,
        "340282366920938463463374607431768211456"
      );

      expect(bal.toString()).to.equal("1");
    });

    it("Should burn subToken when unsubscribed", async () => {
      let data = {
        user: charlie.address,
        nonce: 0,
        action: "mint",
      };

      let signature = await _walletCharlie._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await quallaSub.mintSubscription(
        charlie.address,
        2,
        testDai.address,
        10,
        signature.v,
        signature.r,
        signature.s
      );

      data = {
        user: bob.address,
        nonce: 0,
        action: "subscribe",
      };

      signature = await _walletBob._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await quallaSub.buySubscription(
        bob.address,
        "340282366920938463463374607431768211456",
        signature.v,
        signature.r,
        signature.s
      );

      // unsubscribe

      data = {
        user: bob.address,
        nonce: 1,
        action: "unsubscribe",
      };

      signature = await _walletBob._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await quallaSub.unSubscribe(
        bob.address,
        "340282366920938463463374607431768211457",
        signature.v,
        signature.r,
        signature.s
      );

      let bal = await quallaSub.balanceOf(
        bob.address,
        "340282366920938463463374607431768211457"
      );

      expect(bal.toString()).to.equal("0");

      bal = await quallaSub.balanceOf(
        charlie.address,
        "340282366920938463463374607431768211456"
      );
      expect(bal.toString()).to.equal("2");
    });

    it("Should execute subscription and update nextWidthdraw", async () => {
      let data = {
        user: charlie.address,
        nonce: 0,
        action: "mint",
      };

      let signature = await _walletCharlie._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await quallaSub.mintSubscription(
        charlie.address,
        2,
        testDai.address,
        100,
        signature.v,
        signature.r,
        signature.s
      );

      data = {
        user: bob.address,
        nonce: 0,
        action: "subscribe",
      };

      signature = await _walletBob._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await quallaSub.buySubscription(
        bob.address,
        "340282366920938463463374607431768211456",
        signature.v,
        signature.r,
        signature.s
      );

      let bal = await testDai.balanceOf(charlie.address);

      expect(bal.toString()).to.equal("95");

      bal = await testDai.balanceOf(alice.address);

      expect(bal.toString()).to.equal("5");

      let nextWidth = await quallaSub.tokenId_ToNextWithdraw(
        "340282366920938463463374607431768211457"
      );

      expect(nextWidth.toString()).to.equal("15");
    });
  });
});
