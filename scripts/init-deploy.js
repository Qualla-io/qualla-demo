// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {

  let chainId = 31337;

  let Qualla = await ethers.getContractFactory("Qualla");
  let qualla = await Qualla.deploy("http://localhost:4000/graphql?query={nftMetadata{uriID}}", chainId);


  await qualla.deployed();

  console.log("Qualla deployed to:", qualla.address);

  let TestDai = await ethers.getContractFactory("TestDai");
  testDai = await TestDai.deploy(31337);

  await testDai.deployed();

  console.log("Dai deployed to:", testDai.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
