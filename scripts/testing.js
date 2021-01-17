require("@nomiclabs/hardhat-ethers");

async function main() {
  let subscriptionV1 = await ethers.getContractAt(
    "SubscriptionV1",
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );
  let testDai = await ethers.getContractAt(
    "TestDai",
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  );

  let alice, bob, charlie;

  [alice, bob, charlie] = await ethers.getSigners();

  await testDai.mintTokens(bob.address,1000);
  await testDai.mintTokens(charlie.address,1000);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
