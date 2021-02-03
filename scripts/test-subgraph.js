const hre = require("hardhat");
const { deployProject } = require("./deploy");

async function main() {
  const {
    qDai,
    factoryFacet,
    tierTokenFacet,
    beamTokenFacet,
    quallaDiamond,
  } = await deployProject("Graph Test");

  domain = {
    name: "Qualla Subscription",
    version: "1",
    chainId: 31337,
    verifyingContract: quallaDiamond.address,
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

  await factoryFacet.demoMintWrappedERC20(
    qDai.address,
    bob.address,
    ethers.utils.parseEther("100").toString()
  );

  // mint one tier token -----------------------------------------------

  let data = {
    user: charlie.address,
    nonce: 0,
    action: "mint",
  };

  let signature = await _walletCharlie._signTypedData(domain, types, data);

  signature = ethers.utils.splitSignature(signature);

  await tierTokenFacet.mintTier(
    charlie.address,
    5,
    qDai.address,
    2628000, // $1 per month
    signature.v,
    signature.r,
    signature.s
  );

  // mint a batch of subscriptions -----------------------------------------------

  let paymentTokens = [qDai.address, qDai.address, qDai.address];
  let paymentValues = [2628000, 26280000, 262800000]; //$1, 10, 100 per month

  data = {
    user: charlie.address,
    nonce: 1,
    action: "mint",
  };

  signature = await _walletCharlie._signTypedData(domain, types, data);

  signature = ethers.utils.splitSignature(signature);

  await tierTokenFacet.mintBatchTier(
    charlie.address,
    [0, 0, 0],
    paymentTokens,
    paymentValues,
    signature.v,
    signature.r,
    signature.s
  );

  // buy a subscription -----------------------------------------------
  data = {
    user: bob.address,
    nonce: 0,
    action: "subscribe",
  };

  signature = await _walletBob._signTypedData(domain, types, data);

  signature = ethers.utils.splitSignature(signature);

  await beamTokenFacet.mintBeam(
    bob.address,
    "340282366920938463463374607431768211456",
    signature.v,
    signature.r,
    signature.s
  );

  // for (var i = 0; i < 50; i++) {
  //   data = {
  //     user: charlie.address,
  //     nonce: i + 1,
  //     action: "nft",
  //   };

  //   signature = await _walletCharlie._signTypedData(domain, types, data);

  //   signature = ethers.utils.splitSignature(signature);

  //   await qualla.mintBatchNFT(
  //     charlie.address,
  //     420,
  //     "TEST",
  //     signature.v,
  //     signature.r,
  //     signature.s
  //   );
  // }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
