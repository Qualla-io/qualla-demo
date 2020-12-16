const hre = require("hardhat");

async function main() {
  let abiCoder = hre.ethers.utils.defaultAbiCoder;

  // We get the contract to deploy
  let SubscriptionV1 = await ethers.getContractFactory("SubscriptionV1");
  subscriptionV1 = await SubscriptionV1.deploy();

  await subscriptionV1.deployed();

  console.log("subscription deployed to:", subscriptionV1.address);

  let TestDai = await ethers.getContractFactory("TestDai");
  testDai = await TestDai.deploy(31337);

  await testDai.deployed();

  domain = {
    name: "Qualla Subscription",
    version: "1",
    chainId: 31337,
    verifyingContract: subscriptionV1.address,
  };

  creatorTypes = {
    User: [
      { name: "user", type: "address" },
      { name: "nonce", type: "uint256" },
    ],
  };

  let alice, bob, charlie;

  [alice, bob, charlie] = await ethers.getSigners();

  await testDai.mintTokens(bob.address);
  await testDai.mintTokens(charlie.address);

  _wallet = new ethers.Wallet(
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
  );
  _walletCharlie = new ethers.Wallet(
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
  );

  let data = abiCoder.encode(
    ["address[]", "uint256[]"],
    [
      [testDai.address, testDai.address, testDai.address],
      [10, 20, 30],
    ]
  );

  let creatorData = {
    user: bob.address,
    nonce: 0,
  };

  let signature = await _wallet._signTypedData(
    domain,
    creatorTypes,
    creatorData
  );

  signature = ethers.utils.splitSignature(signature);

  await subscriptionV1.mintBatchSubscription(
    bob.address,
    [0, 0, 0],
    signature.v,
    signature.r,
    signature.s,
    data
  );

  data = abiCoder.encode(
    ["address[]", "uint256[]"],
    [[testDai.address], [10]]
  );

  // mint a bunch of subscriptions
  for (var i = 1; i < 5; i++) {
    creatorData = {
      user: bob.address,
      nonce: i,
    };

    signature = await _wallet._signTypedData(domain, creatorTypes, creatorData);

    signature = ethers.utils.splitSignature(signature);

    await subscriptionV1.mintSubscription(
      bob.address,
      0,
      signature.v,
      signature.r,
      signature.s,
      data
    );
  }

  //   User subscribing
  let subscriberData = {
    user: charlie.address,
    nonce: 0,
  };

  signature = await _walletCharlie._signTypedData(
    domain,
    creatorTypes,
    subscriberData
  );

  signature = ethers.utils.splitSignature(signature);

  await subscriptionV1.buySubscription(
    charlie.address,
    "340282366920938463463374607431768211456", //stru.id,
    signature.v,
    signature.r,
    signature.s
  );

  //   Subscribe a bunch
  for (var i = 1; i < 4; i++) {
    subscriberData = {
      user: charlie.address,
      nonce: i,
    };

    signature = await _walletCharlie._signTypedData(
      domain,
      creatorTypes,
      subscriberData
    );

    signature = ethers.utils.splitSignature(signature);

    await subscriptionV1.buySubscription(
      charlie.address,
      "340282366920938463463374607431768211456", //stru.id,
      signature.v,
      signature.r,
      signature.s
    );

    for (var i = 0; i < 5; i++) {
      await subscriptionV1.mintNFT();
    }
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
