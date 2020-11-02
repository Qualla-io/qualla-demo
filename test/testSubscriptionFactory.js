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
  beforeEach(async () => {
    factory = await SubscriptionFactory.new(5);
    dai = await Dai.new(5777);
    provider = new ethers.providers.Web3Provider(web3.currentProvider);
    factory = new ethers.Contract(factory.address, factory.abi, provider);

    alice = new ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/0`);
    alice = alice.connect(provider);
    bob = new ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/1`);
    bob = bob.connect(provider);
  });

  xcontext("With updating factory settings", async () => {
    it("Should update fee for master", async () => {
      factory = factory.connect(alice);

      await factory.setFee(4);
      const fee = parseInt(await factory.fee());
      assert.strictEqual(fee, 4);
    });

    it("Should not update fee for not master", async () => {
      factory = factory.connect(bob);
      utils.shouldThrow(factory.setFee(7));
    });

    it("Should not update fee for higher fee", async () => {
      factory = factory.connect(alice);
      utils.shouldThrow(factory.setFee(7));
    });

    it("Should transfer master for master", async () => {
      factory = factory.connect(alice);

      await factory.setMaster(bob.address);
      const master = await factory.master();
      assert.strictEqual(master, bob.address);
    });

    it("Should not transfer master for not master", async () => {
      factory = factory.connect(bob);
      utils.shouldThrow(factory.setMaster(bob.address));
    });
  });

  xcontext("With creating subscription contracts", async () => {
    it("Should create a subscription", async () => {
      factory = factory.connect(alice);

      await factory.createSubscription(bob.address, [dai.address], [5]);

      var address = await factory.getSubscription(bob.address);
      assert.notStrictEqual(
        address,
        "0x0000000000000000000000000000000000000000"
      );
    });

    it("Should not allow more than on subscription per publisher", async () => {
      factory = factory.connect(alice);

      await factory.createSubscription(bob.address, [dai.address], [5]);

      utils.shouldThrow(
        factory.createSubscription(bob.address, [dai.address], [5])
      );
    });

    it("Should allow for multiple payment coins and values", async () => {
      factory = factory.connect(alice);

      // Using alice's address as dummy token
      await factory.createSubscription(
        bob.address,
        [dai.address, alice.address],
        [5, 10]
      );

      var address = await factory.getSubscription(bob.address);

      subscription = new ethers.Contract(address, SubscriptionV1.abi, provider);

      var tokens = await subscription.paymentTokens(1);
      var values = await subscription.acceptedValues(1);
      assert.strictEqual(tokens, alice.address);
      assert.strictEqual(parseInt(values), 10);
    });
  });
});
