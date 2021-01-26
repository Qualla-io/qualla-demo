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
  let quallaBase;
  let _walletBob;

  beforeEach(async () => {
    let QuallaBase = await ethers.getContractFactory("QuallaBase");
    quallaBase = await QuallaBase.deploy("URI_TEST", chainId);

    domain = {
      name: "Qualla Subscription",
      version: "1",
      chainId: 31337,
      verifyingContract: quallaBase.address,
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
  });

  context("With checking utils", async () => {
    it("Should set Fee", async () => {
      await quallaBase.setFee(4);

      let fee = await quallaBase.fee();
      expect(parseInt(fee)).to.equal(4);
    });

    // Set master to public to test directly
    xit("Should set Master", async () => {
      await quallaBase.setMaster(bob.address);

      let master = await quallaBase.master();
      expect(master).to.equal(bob.address);
    });

    // Set _verifySignature to public to test directly
    xit("Should verify signatures", async () => {
      const data = {
        user: bob.address,
        nonce: 0,
        action: "mint",
      };

      let signature = await _walletBob._signTypedData(domain, types, data);

      signature = ethers.utils.splitSignature(signature);

      await quallaBase._verifySignature(
        bob.address,
        "mint",
        signature.v,
        signature.r,
        signature.s
      );
    });
  });
});
