const assert = require("assert");
const utils = require("./helpers/utils");

const SubscriptionFactory = artifacts.require("SubscriptionFactory");
const Dai = artifacts.require("TestDai");
const SubscriptionV1 = artifacts.require("SubscriptionV1");

const { ethers } = require("ethers");

const mnemonic =
  "manage echo project print mom useless zoo liar unhappy uncle pretty shrimp";

contract("SubscriptionFactory", (accounts) => {
  let [alice0, bob0] = accounts;

  let factory;
  let dai;
  let provider;
  let alice;
  let bob;
  let subscriptionAddress;
  beforeEach(async () => {
    factory = await SubscriptionFactory.new(5);
    dai = await Dai.new(5777);
    provider = new ethers.providers.Web3Provider(web3.currentProvider);
    factory = new ethers.Contract(factory.address, factory.abi, provider);
    dai = new ethers.Contract(dai.address, dai.abi, provider);

    alice = new ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/0`);
    alice = alice.connect(provider);
    bob = new ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/1`);
    bob = bob.connect(provider);
    charlie = new ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/2`);
    charlie = charlie.connect(provider);

    // Deploy first subscription
    factory = factory.connect(alice);
    await factory.createSubscription(bob.address, [dai.address], [5]);
    subscriptionAddress = await factory.getSubscription(bob.address);
    subscription = new ethers.Contract(
      subscriptionAddress,
      SubscriptionV1.abi,
      provider
    );
  });

  context("With subscribing to contract", async () => {
      
  });

  context("With contract functions", async () => {
    it("Should allow withdraws", async () => {
      dai = dai.connect(alice);
      subscription = subscription.connect(alice);
      await dai.mintTokens(subscriptionAddress);
      const fee = parseInt(await factory.fee());

      const initalBal = parseInt(await dai.balanceOf(subscriptionAddress));

      await subscription.withdraw();

      const masterBal = parseInt(await dai.balanceOf(alice.address));
      const publisherBal = parseInt(await dai.balanceOf(bob.address));

      assert.strictEqual(masterBal, (initalBal * fee) / 100);
      assert.strictEqual(publisherBal, (initalBal * (100 - fee)) / 100);
    });

    it("Should not allow initialize to be called by accounts", async () => {
      subscription = subscription.connect(alice);

      utils.shouldThrow(
        subscription.initalize(bob.address, [dai.address], [5])
      );
    });
  });
});
