const { expect } = require("chai");
const { ethers } = require("hardhat");

const { deployProject } = require("../scripts/deploy.js");

function getSelectors(contract) {
  const signatures = Object.keys(contract.interface.functions);
  const selectors = signatures.reduce((acc, val) => {
    if (val !== "init(bytes)") {
      acc.push(contract.interface.getSighash(val));
    }
    return acc;
  }, []);
  return selectors;
}

describe("Qualla Diamond Contract", function () {
  let alice;
  let bob;
  let charlie;
  let daniel;

  let quallaDiamond;
  let diamondCutFacet;
  let diamondLoupeFacet;
  let ownershipFacet;

  let result;
  let addresses = [];

  const FacetCutAction = {
    Add: 0,
    Replace: 1,
    Remove: 2,
  };

  beforeEach(async () => {
    [alice, bob, charlie, daniel] = await ethers.getSigners();

    const deployVars = await deployProject("deployTest");
    global.set = true;
    global.quallaDiamond = deployVars.quallaDiamond;
    global.diamondLoupeFacet = deployVars.diamondLoupeFacet;
    global.testDai = deployVars.testDai;

    diamondLoupeFacet = new ethers.Contract(
      deployVars.quallaDiamond.address,
      deployVars.diamondLoupeFacet.interface,
      alice
    );

    diamondCutFacet = new ethers.Contract(
      deployVars.quallaDiamond.address,
      deployVars.diamondCutFacet.interface,
      alice
    );

    ownershipFacet = new ethers.Contract(
      deployVars.quallaDiamond.address,
      deployVars.ownershipFacet.interface,
      alice
    );
  });

  xcontext("With testing deployment", async () => {
    xit("Should have three facets", async () => {
      for (const address of await diamondLoupeFacet.facetAddresses()) {
        addresses.push(address);
      }

      expect(addresses.length).to.equal(3);
    });

    it("facets should have the right function selectors -- call to facetFunctionSelectors function", async () => {
      addresses = await diamondLoupeFacet.facetAddresses();

      let selectors = getSelectors(diamondCutFacet);
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      expect(result).to.equal(result, selectors);

      selectors = getSelectors(diamondLoupeFacet);
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[1]);
      expect(result).to.equal(result, selectors);

      selectors = getSelectors(ownershipFacet);
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[2]);
      expect(result).to.equal(result, selectors);
    });

    it("selectors should be associated to facets correctly -- multiple calls to facetAddress function", async () => {
      addresses = await diamondLoupeFacet.facetAddresses();

      expect(addresses[0]).to.equal(
        await diamondLoupeFacet.facetAddress("0x1f931c1c")
      );
      expect(addresses[1]).to.equal(
        await diamondLoupeFacet.facetAddress("0xcdffacc6")
      );
      expect(addresses[1]).to.equal(
        await diamondLoupeFacet.facetAddress("0x01ffc9a7")
      );
      expect(addresses[2]).to.equal(
        await diamondLoupeFacet.facetAddress("0xf2fde38b")
      );
    });

    // etc... https://github.com/mudgen/diamond-3/blob/master/test/diamondTest.js
  });
});
