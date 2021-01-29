const diamond = require("diamond-util");

async function main(scriptName) {
  console.log("SCRIPT NAME:", scriptName);
  const accounts = await ethers.getSigners();
  const account = await accounts[0].getAddress();

  if (hre.network.name === "hardhat") {
    let TestDai = await ethers.getContractFactory("TestDai");
    testDai = await TestDai.deploy(31337);
    await testDai.deployed();
    console.log("Dai deployed to:", testDai.address);
  } else {
    throw Error("No network settings for " + hre.network.name);
  }

  async function deployFacets(...facets) {
    const instances = [];
    for (let facet of facets) {
      let constructorArgs = [];
      if (Array.isArray(facet)) {
        [facet, constructorArgs] = facet;
      }
      const factory = await ethers.getContractFactory(facet);
      const facetInstance = await factory.deploy(...constructorArgs);
      await facetInstance.deployed();
      //   const tx = facetInstance.deployTransaction;
      //   const receipt = await tx.wait();
      //   console.log(`${facet} deploy gas used:` + strDisplay(receipt.gasUsed));
      //   totalGasUsed = totalGasUsed.add(receipt.gasUsed);
      instances.push(facetInstance);
    }
    return instances;
  }

  let [
    diamondCutFacet,
    diamondLoupeFacet,
    ownershipFacet,
    erc1155Facet,
    subscriptionFacet,
    nftFacet,
  ] = await deployFacets(
    "DiamondCutFacet",
    "DiamondLoupeFacet",
    "OwnershipFacet",
    "ERC1155Facet",
    "QuallaSubscriptionsFacet",
    "QuallaNFTFacet"
  );

  const quallaDiamond = await diamond.deploy({
    diamondName: "QuallaDiamond",
    facets: [
      ["DiamondCutFacet", diamondCutFacet],
      ["DiamondLoupeFacet", diamondLoupeFacet],
      ["OwnershipFacet", ownershipFacet],
      ["ERC1155Facet", erc1155Facet],
      ["QuallaSubscriptionsFacet", subscriptionFacet],
      ["QuallaNFTFacet", nftFacet],
    ],
    args: [accounts[0].address, 31337, "1"], //[owner, chainId, version]
  });

  console.log("Qualla diamond address:" + quallaDiamond.address);

  return {
    account: account,
    quallaDiamond: quallaDiamond,
    diamondLoupeFacet: diamondLoupeFacet,
    diamondCutFacet: diamondCutFacet,
    ownershipFacet: ownershipFacet,
    erc1155Facet: erc1155Facet,
    subscriptionFacet: subscriptionFacet,
    nftFacet: nftFacet,
    testDai: testDai,
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deployProject = main;
