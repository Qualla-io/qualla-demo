const { expect } = require("chai");
const { ethers } = require("hardhat");
const { shouldThrow } = require("./utils");

describe("Qualla NFT Contract", function () {
  let chainId = 31337;
  let domain;
  let types;
  let alice;
  let bob;
  let charlie;
  let daniel;
  let quallaNFT;
  let _walletBob;
  let _walletCharlie;

  beforeEach(async () => {
    let QuallaNFT = await ethers.getContractFactory("Qualla");
    quallaNFT = await QuallaNFT.deploy("URI_TEST", chainId);

    let TestDai = await ethers.getContractFactory("TestDai");
    testDai = await TestDai.deploy(31337);

    domain = {
      name: "Qualla Subscription",
      version: "1",
      chainId: 31337,
      verifyingContract: quallaNFT.address,
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
    await _testDai.approve(quallaNFT.address, 1000);
  });

  context("With minting NFTs", async () => {
    xit("should mint batch of NFTs", async () => {
      const data = {
        user: charlie.address,
        nonce: 0,
        action: "nft",
      };

      let signature = await _walletCharlie._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await quallaNFT.mintBatchNFT(
        charlie.address,
        5,
        "TEST",
        signature.v,
        signature.r,
        signature.s
      );

      let res = await quallaNFT.uri(
        "57896044618658097711785492504343953926975274699741220483192166611388333031424"
      );

      expect(res.toString()).to.equal("TEST");

      res = await quallaNFT.uri(
        "57896044618658097711785492504343953926975274699741220483192166611388333031428"
      );

      expect(res.toString()).to.equal("TEST");
    });
    it("Should mint NFT to subscribers of baseToken", async () => {
      let data = {
        user: charlie.address,
        nonce: 0,
        action: "mint",
      };

      let signature = await _walletCharlie._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await quallaNFT.mintSubscription(
        charlie.address,
        10,
        testDai.address,
        10,
        signature.v,
        signature.r,
        signature.s
      );

      for (var i = 0; i < 5; i++) {
        data = {
          user: bob.address,
          nonce: i,
          action: "subscribe",
        };

        signature = await _walletBob._signTypedData(domain, types, data);

        signature = ethers.utils.splitSignature(signature);

        await quallaNFT.buySubscription(
          bob.address,
          "340282366920938463463374607431768211456",
          signature.v,
          signature.r,
          signature.s
        );
      }

      data = {
        user: charlie.address,
        nonce: 1,
        action: "nft",
      };

      signature = await _walletCharlie._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await quallaNFT.mintNFTtoSubscribers(
        charlie.address,
        "340282366920938463463374607431768211456",
        "TEST",
        signature.v,
        signature.r,
        signature.s
      );

      let baseNFT =
        "57896044618658097711785492504343953927315557066662158946655541218820101242880"; // NFT id #1

      let bal = await quallaNFT.balanceOf(charlie.address, baseNFT);

      expect(bal.toString()).to.equal("6");

      let res = await quallaNFT.nfts(0);

      expect(res.creator.toString()).to.equal(charlie.address);

      expect(res.index.toString()).to.equal("1");
    });

    it("Should redeem NFT to subtoken holder", async () => {
      let data = {
        user: charlie.address,
        nonce: 0,
        action: "mint",
      };

      let signature = await _walletCharlie._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await quallaNFT.mintSubscription(
        charlie.address,
        10,
        testDai.address,
        10,
        signature.v,
        signature.r,
        signature.s
      );

      for (var i = 0; i < 5; i++) {
        data = {
          user: bob.address,
          nonce: i,
          action: "subscribe",
        };

        signature = await _walletBob._signTypedData(domain, types, data);

        signature = ethers.utils.splitSignature(signature);

        await quallaNFT.buySubscription(
          bob.address,
          "340282366920938463463374607431768211456",
          signature.v,
          signature.r,
          signature.s
        );
      }

      data = {
        user: charlie.address,
        nonce: 1,
        action: "nft",
      };

      signature = await _walletCharlie._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await quallaNFT.mintNFTtoSubscribers(
        charlie.address,
        "340282366920938463463374607431768211456",
        "TEST",
        signature.v,
        signature.r,
        signature.s
      );

      let baseNFT =
        "57896044618658097711785492504343953927315557066662158946655541218820101242880"; // NFT id #1

      let subToken = "340282366920938463463374607431768211457";

      data = {
        user: bob.address,
        nonce: 5,
        action: "redeem",
      };

      signature = await _walletBob._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await quallaNFT.claimNFT(
        bob.address,
        subToken,
        baseNFT,
        signature.v,
        signature.r,
        signature.s
      );

      let bal = await quallaNFT.balanceOf(
        bob.address,
        "57896044618658097711785492504343953927315557066662158946655541218820101242881"
      );

      expect(bal.toString()).to.equal("1");

      // Test that you cant redeem twice
      data = {
        user: bob.address,
        nonce: 6,
        action: "redeem",
      };

      signature = await _walletBob._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await shouldThrow(
        quallaNFT.claimNFT(
          bob.address,
          subToken,
          baseNFT,
          signature.v,
          signature.r,
          signature.s
        )
      );

    });
  });
});
