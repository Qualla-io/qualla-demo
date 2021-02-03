const { expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber = require("bignumber.js");
const { deployProject } = require("../scripts/deploy.js");
const { shouldThrow } = require("./utils.js");

describe("Qualla BeamToken Facet", function () {
  let alice, bob, charlie, daniel;
  let _walletBob, _walletCharlie, _walletDaniel;

  let tierTokenFacet, beamTokenFacet, erc1155Facet, factoryFacet;
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

  async function buyOneSubToken(usr, wallet) {
    data = {
      user: usr.address,
      nonce: 0,
      action: "subscribe",
    };

    signature = await wallet._signTypedData(domain, types, data);

    signature = ethers.utils.splitSignature(signature);

    await beamTokenFacet.mintBeam(
      usr.address,
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
    beamTokenFacet = deployVars.beamTokenFacet;
    factoryFacet = deployVars.factoryFacet;
    erc1155Facet = deployVars.erc1155Facet;

    qDai = deployVars.qDai;

    await factoryFacet.demoMintWrappedERC20(
      qDai.address,
      bob.address,
      ethers.utils.parseEther("100").toString()
    );

    _walletBob = new ethers.Wallet(
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
    );

    _walletCharlie = new ethers.Wallet(
      "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
    );

    _walletDaniel = new ethers.Wallet(
      "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
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

  context("With minting beams", async () => {
    it("Should mint new beam from tierToken when bought", async () => {
      await mintOneTierToken();

      await buyOneSubToken(bob, _walletBob);

      result = await erc1155Facet.balanceOf(
        bob.address,
        "340282366920938463463374607431768211457"
      );

      expect(result.toString()).to.equal("1");

      result = await erc1155Facet.balanceOf(
        charlie.address,
        "340282366920938463463374607431768211456"
      );

      expect(result.toString()).to.equal("4");

      ethers.provider.send("evm_increaseTime", [60]);
      ethers.provider.send("evm_mine");

      // Should update flows

      let [balance, deposit] = await beamTokenFacet.reatimeBalanceNow(
        qDai.address,
        bob.address
      );

      expect(balance.toString()).to.equal("-600");
      expect(deposit.toString()).to.equal("864000");

      [balance, deposit] = await beamTokenFacet.reatimeBalanceNow(
        qDai.address,
        charlie.address
      );

      expect(balance.toString()).to.equal("600");
      expect(deposit.toString()).to.equal("0");
    });

    it("Shouldn't allow minting beam to someone with funds below deposit", async () => {
      await mintOneTierToken();

      await shouldThrow(buyOneSubToken(daniel, _walletDaniel));

      await factoryFacet.demoMintWrappedERC20(
        qDai.address,
        daniel.address,
        "864000".toString()
      );

      await buyOneSubToken(daniel, _walletDaniel);
    });

    it("Should burn subToken when unsubscribed", async () => {
      let initalBal = await qDai.balanceOf(bob.address);

      await mintOneTierToken();

      await buyOneSubToken(bob, _walletBob);

      let test = await qDai.balanceOf(bob.address);

      console.log(test.toString());

      // move forward 1 minute
      ethers.provider.send("evm_increaseTime", [59]);
      ethers.provider.send("evm_mine");

      data = {
        user: bob.address,
        nonce: 1,
        action: "unsubscribe",
      };

      signature = await _walletBob._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await beamTokenFacet.unSubscribe(
        bob.address,
        "340282366920938463463374607431768211457",
        signature.v,
        signature.r,
        signature.s
      );

      // check flows

      let [unsettledBalance, deposit] = await beamTokenFacet.reatimeBalanceNow(
        qDai.address,
        bob.address
      );

      expect(unsettledBalance.toString()).to.equal("0");
      expect(deposit.toString()).to.equal("0");

      [unsettledBalance, deposit] = await beamTokenFacet.reatimeBalanceNow(
        qDai.address,
        charlie.address
      );

      expect(unsettledBalance.toString()).to.equal("0");
      expect(deposit.toString()).to.equal("0");

      // check settle balance

      let finalBal = await qDai.balanceOf(bob.address);

      balDif = new BigNumber(finalBal.toString()).minus(initalBal.toString());

      expect(balDif.toFixed()).to.equal("-600");

      let charlieBalance = await qDai.balanceOf(charlie.address);

      expect(charlieBalance.toString()).to.equal("600");

      // Check erc1155 burn/mint

      result = await erc1155Facet.balanceOf(
        bob.address,
        "340282366920938463463374607431768211457"
      );

      expect(result.toString()).to.equal("0");

      result = await erc1155Facet.balanceOf(
        charlie.address,
        "340282366920938463463374607431768211456"
      );

      expect(result.toString()).to.equal("5");
    });
  });
});
