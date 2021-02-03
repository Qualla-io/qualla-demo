const { expect } = require("chai");
const { ethers } = require("hardhat");

const { deployProject } = require("../scripts/deploy.js");

describe("Qualla TierToken Facet", function () {

  
  let alice;
  let bob;
  let charlie;
  let daniel;
  let _walletBob;
  let _walletCharlie;

  let tierTokenFacet;
  let beamTokenFacet;
  let erc1155Facet;
  let qDai;

  let result;
  let signature;
  let data;

  let domain;

  let types = {
    User: [
      { name: "user", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "action", type: "string" },
    ],
  };

  async function mintOneTierToken() {
    data = {
      user: charlie.address,
      nonce: 0,
      action: "mint",
    };

    signature = await _walletCharlie._signTypedData(domain, types, data);

    signature = ethers.utils.splitSignature(signature);

    await tierTokenFacet.mintTier(
      charlie.address,
      5,
      qDai.address,
      10,
      signature.v,
      signature.r,
      signature.s
    );
  }

  async function buyOneSubToken() {
    data = {
      user: bob.address,
      nonce: 0,
      action: "subscribe",
    };

    signature = await _walletBob._signTypedData(domain, types, data);

    signature = ethers.utils.splitSignature(signature);

    await beamTokenFacet.mintBeam(
      bob.address,
      "340282366920938463463374607431768211456",
      signature.v,
      signature.r,
      signature.s
    );
  }

  beforeEach(async () => {
    [alice, bob, charlie, daniel] = await ethers.getSigners();

    const deployVars = await deployProject("deployTest");
    global.set = true;
    global.quallaDiamond = deployVars.quallaDiamond;
    global.testDai = deployVars.testDai;

    tierTokenFacet = deployVars.tierTokenFacet;

    erc1155Facet = deployVars.erc1155Facet;

    qDai = deployVars.qDai;

    _walletBob = new ethers.Wallet(
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
    );

    _walletCharlie = new ethers.Wallet(
      "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
    );

    let _testDai = await testDai.connect(bob);
    await _testDai.approve(deployVars.quallaDiamond.address, 1000);

    domain = {
      name: "Qualla Subscription",
      version: "1",
      chainId: 31337,
      verifyingContract: deployVars.quallaDiamond.address,
    };
  });

  context("With minting subscriptions", async () => {
    it("Should mint new tierToken", async () => {
      await mintOneTierToken();

      result = await erc1155Facet.balanceOf(
        charlie.address,
        "340282366920938463463374607431768211456"
      );

      expect(result.toString()).to.equal("5");

      result = await tierTokenFacet.getTierToken(
        "340282366920938463463374607431768211456"
      );

      expect(result.creator).to.equal(charlie.address);
      expect(result.paymentToken).to.equal(qDai.address);
    });

    it("Should mint batch of tierTokens", async () => {
      let paymentTokens = [qDai.address, qDai.address, qDai.address];
      let paymentValues = [10, 20, 30];

      let data = {
        user: charlie.address,
        nonce: 0,
        action: "mint",
      };

      let signature = await _walletCharlie._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await tierTokenFacet.mintBatchTier(
        charlie.address,
        [0, 0, 0],
        paymentTokens,
        paymentValues,
        signature.v,
        signature.r,
        signature.s
      );

      result = await tierTokenFacet.getTierToken(
        "1020847100762815390390123822295304634368" // Token 3 id
      );

      expect(result.flowRate.toString()).to.equal("30");
    });

    it("Should burn tierToken", async () => {
      await mintOneTierToken();

      data = {
        user: charlie.address,
        nonce: 1,
        action: "burn",
      };

      signature = await _walletCharlie._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await tierTokenFacet.burnTier(
        "340282366920938463463374607431768211456",
        1,
        signature.v,
        signature.r,
        signature.s
      );

      result = await erc1155Facet.balanceOf(
        charlie.address,
        "340282366920938463463374607431768211456"
      );

      expect(result.toString()).to.equal("4");
    });

  });
});
