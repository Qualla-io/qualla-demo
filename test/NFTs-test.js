const { expect } = require("chai");
const { ethers } = require("hardhat");

const { deployProject } = require("../scripts/deploy.js");

describe("Qualla Diamond Contract", function () {
  let alice;
  let bob;
  let charlie;
  let daniel;
  let _walletBob;
  let _walletCharlie;

  let subscriptionFacet;
  let erc1155Facet;
  let nftFacet;

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

    await subscriptionFacet.mintSubscription(
      charlie.address,
      5,
      testDai.address,
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

    await subscriptionFacet.buySubscription(
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

    subscriptionFacet = new ethers.Contract(
      deployVars.quallaDiamond.address,
      deployVars.subscriptionFacet.interface,
      alice
    );

    nftFacet = new ethers.Contract(
      deployVars.quallaDiamond.address,
      deployVars.nftFacet.interface,
      alice
    );

    erc1155Facet = new ethers.Contract(
      deployVars.quallaDiamond.address,
      deployVars.erc1155Facet.interface,
      alice
    );

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

  xcontext("With minting NFTs", async () => {
    it("should mint NFTs to subscribers", async () => {
      await mintOneTierToken();

      await buyOneSubToken();

      data = {
        user: charlie.address,
        nonce: 1,
        action: "nft",
      };

      let signature = await _walletCharlie._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await nftFacet.mintNFTtoSubscribers(
        "340282366920938463463374607431768211456",
        "TEST",
        signature.v,
        signature.r,
        signature.s
      );

      result = await erc1155Facet.balanceOf(
        charlie.address,
        "57896044618658097711785492504343953927315557066662158946655541218820101242880"
      );

      expect(result.toString()).to.equal("2");
    });

    it("Should allow user to claim nft", async () => {
      await mintOneTierToken();

      await buyOneSubToken();

      data = {
        user: charlie.address,
        nonce: 1,
        action: "nft",
      };

      signature = await _walletCharlie._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await nftFacet.mintNFTtoSubscribers(
        "340282366920938463463374607431768211456",
        "TEST",
        signature.v,
        signature.r,
        signature.s
      );

      data = {
        user: bob.address,
        nonce: 1,
        action: "claim",
      };

      signature = await _walletBob._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await nftFacet.claimNFT(
        bob.address,
        "340282366920938463463374607431768211457",
        "57896044618658097711785492504343953927315557066662158946655541218820101242880",
        signature.v,
        signature.r,
        signature.s
      );

      result = await erc1155Facet.balanceOf(
        bob.address,
        "57896044618658097711785492504343953927315557066662158946655541218820101242881"
      );

      expect(result.toString()).to.equal("1");
    });
  });
});
