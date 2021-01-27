const hre = require("hardhat");

async function main() {
  let abiCoder = hre.ethers.utils.defaultAbiCoder;

  let chainId = 31337;

  // We get the contract to deploy
  let Qualla = await ethers.getContractFactory("Qualla");
  let qualla = await Qualla.deploy("URI_TEST", chainId);

  await qualla.deployed();

  console.log("subscription deployed to:", qualla.address);

  let TestDai = await ethers.getContractFactory("TestDai");
  testDai = await TestDai.deploy(chainId);

  await testDai.deployed();

  console.log("Dai deployed to:", testDai.address);

  domain = {
    name: "Qualla Subscription",
    version: "1",
    chainId: 31337,
    verifyingContract: qualla.address,
  };

  types = {
    User: [
      { name: "user", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "action", type: "string" },
    ],
  };

  let alice, bob, charlie;

  [alice, bob, charlie] = await ethers.getSigners();

  _walletBob = new ethers.Wallet(
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
  );
  _walletCharlie = new ethers.Wallet(
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
  );

  let _testDai = await testDai.connect(bob);
  await _testDai.approve(qualla.address, 1000);

  // mint a batch of subscriptions

  let paymentTokens = [testDai.address, testDai.address, testDai.address];
  let paymentValues = [10, 20, 30];

  let data = {
    user: charlie.address,
    nonce: 0,
    action: "mint",
  };

  let signature = await _walletCharlie._signTypedData(domain, types, data);

  signature = ethers.utils.splitSignature(signature);

  await qualla.mintBatchSubscription(
    charlie.address,
    [0, 0, 0],
    paymentTokens,
    paymentValues,
    signature.v,
    signature.r,
    signature.s
  );

  // Test Subscribe
  data = {
    user: bob.address,
    nonce: 0,
    action: "subscribe",
  };

  signature = await _walletBob._signTypedData(domain, types, data);

  signature = ethers.utils.splitSignature(signature);

  await qualla.buySubscription(
    bob.address,
    "340282366920938463463374607431768211456",
    signature.v,
    signature.r,
    signature.s
  );

  for (var i = 0; i < 50; i++) {
    data = {
      user: charlie.address,
      nonce: i + 1,
      action: "nft",
    };

    signature = await _walletCharlie._signTypedData(domain, types, data);

    signature = ethers.utils.splitSignature(signature);

    await qualla.mintBatchNFT(
      charlie.address,
      420,
      "TEST",
      signature.v,
      signature.r,
      signature.s
    );
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
