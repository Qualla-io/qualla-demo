const diamond = require("diamond-util");

async function main(scriptName) {
  console.log("SCRIPT NAME:", scriptName);
  const accounts = await ethers.getSigners();
  const account = await accounts[0].getAddress();

  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
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
    tierTokenFacet,
    beamTokenFacet,
    nftFacet,
    factoryFacet,
  ] = await deployFacets(
    "DiamondCutFacet",
    "DiamondLoupeFacet",
    "OwnershipFacet",
    "ERC1155Facet",
    "TierTokenFacet",
    "BeamTokenFacet",
    "NFTFacet",
    "TokenFactoryFacet"
  );

  const quallaDiamond = await diamond.deploy({
    diamondName: "QuallaDiamond",
    facets: [
      ["DiamondCutFacet", diamondCutFacet],
      ["DiamondLoupeFacet", diamondLoupeFacet],
      ["OwnershipFacet", ownershipFacet],
      ["ERC1155Facet", erc1155Facet],
      ["TierTokenFacet", tierTokenFacet],
      ["BeamTokenFacet", beamTokenFacet],
      ["NFTFacet", nftFacet],
      ["TokenFactoryFacet", factoryFacet],
    ],
    args: [accounts[0].address, 31337, "1"], //[owner, chainId, version]
  });

  console.log("Qualla diamond address:" + quallaDiamond.address);

  // Wrap facets, is there an easy way to loop this?

  erc1155Facet = new ethers.Contract(
    quallaDiamond.address,
    erc1155Facet.interface,
    accounts[0]
  );

  tierTokenFacet = new ethers.Contract(
    quallaDiamond.address,
    tierTokenFacet.interface,
    accounts[0]
  );

  beamTokenFacet = new ethers.Contract(
    quallaDiamond.address,
    beamTokenFacet.interface,
    accounts[0]
  );

  nftFacet = new ethers.Contract(
    quallaDiamond.address,
    nftFacet.interface,
    accounts[0]
  );

  factoryFacet = new ethers.Contract(
    quallaDiamond.address,
    factoryFacet.interface,
    accounts[0]
  );

  // Wrap testDai

  await factoryFacet.deployERC20WrapperInfo(testDai.address, "qDai", "qDAI");

  let address = await factoryFacet.getTokenWrapper(global.testDai.address);

  let qDai = await ethers.getContractFactory("Qtoken");

  qDai = new ethers.Contract(address, qDai.interface, accounts[0]);

  return {
    account: account,
    quallaDiamond: quallaDiamond,
    diamondLoupeFacet: diamondLoupeFacet,
    diamondCutFacet: diamondCutFacet,
    ownershipFacet: ownershipFacet,
    erc1155Facet: erc1155Facet,
    tierTokenFacet,
    beamTokenFacet,
    nftFacet,
    factoryFacet,
    testDai,
    qDai,
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
