// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  let alice, bob, charlie;

  [alice, bob, charlie] = await ethers.getSigners();

  let SubscriptionV1 = await ethers.getContractFactory("SubscriptionV1");
  subscriptionV1 = await SubscriptionV1.deploy();

  await subscriptionV1.deployed();

  console.log("subscription deployed to:", subscriptionV1.address);

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
