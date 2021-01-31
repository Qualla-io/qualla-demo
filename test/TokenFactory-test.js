const { expect } = require("chai");
const { ethers } = require("hardhat");

const { deployProject } = require("../scripts/deploy.js");

describe("Qualla Token Factory Contract", function () {
  let alice;
  let bob;
  let charlie;
  let daniel;
  let factoryFacet;

  let result;

  beforeEach(async () => {
    [alice, bob, charlie, daniel] = await ethers.getSigners();
    const deployVars = await deployProject("deployTest");
    global.set = true;
    global.quallaDiamond = deployVars.quallaDiamond;
    global.testDai = deployVars.testDai;

    factoryFacet = new ethers.Contract(
      deployVars.quallaDiamond.address,
      deployVars.factoryFacet.interface,
      alice
    );

    let _testDai = await testDai.connect(bob);
    await _testDai.approve(deployVars.quallaDiamond.address, 1000);
  });

  context("With deploying wrapper tokens", async () => {
    it("Should deploy a new wrapper contract", async () => {
      await factoryFacet.deployERC20WrapperInfo(
        global.testDai.address,
        "qDai",
        "qDAI"
      );

      let address = await factoryFacet.getTokenWrapper(global.testDai.address);

      let qDai = await ethers.getContractFactory("Qtoken");

      qDai = new ethers.Contract(address, qDai.interface, alice);

      result = await qDai.name();

      expect(result.toString()).to.equal("qDai");

      result = await qDai.symbol();

      expect(result.toString()).to.equal("qDAI");

      result = await qDai.decimals();

      expect(result.toString()).to.equal("18");
    });
  });
});
