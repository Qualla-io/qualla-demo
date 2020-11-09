const assert = require("assert");
const utils = require("./helpers/utils");

const SubscriptionFactory = artifacts.require("SubscriptionFactory");
const Dai = artifacts.require("TestDai");
const SubscriptionV1 = artifacts.require("SubscriptionV1");

const {ethers} = require("ethers");

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

  xcontext("With subscribing to contract", async () => {
    it("Should return subscription hash", async () => {
      const hash = await subscription.getSubscriptionHash(
        bob.address,
        5,
        dai.address,
        0,
        0
      );

      // some sort of assert here?
    });

    it("Should create new subscription", async () => {
      subscription = subscription.connect(alice);
      const hash = await subscription.getSubscriptionHash(
        charlie.address,
        5,
        dai.address,
        0,
        0
      );

      const signedHash = await charlie.signMessage(ethers.utils.arrayify(hash));

      await subscription.createSubscription(
        charlie.address,
        5,
        dai.address,
        signedHash
      );

      const subLength = await subscription.allSubscribersLength();
      assert.strictEqual(parseInt(subLength), 2);
    });

    it("Should not allow repeat subscription", async () => {
      subscription = subscription.connect(alice);
      const hash = await subscription.getSubscriptionHash(
        charlie.address,
        5,
        dai.address,
        0,
        0
      );

      const signedHash = await charlie.signMessage(ethers.utils.arrayify(hash));

      await subscription.createSubscription(
        charlie.address,
        5,
        dai.address,
        signedHash
      );
      await utils.shouldThrow(
        subscription.createSubscription(
          charlie.address,
          5,
          dai.address,
          signedHash
        )
      );
    });

    it("Should not allow wrong paymentToken", async () => {
      subscription = subscription.connect(alice);
      const hash = await subscription.getSubscriptionHash(
        charlie.address,
        5,
        charlie.address,
        0,
        0
      );

      const signedHash = await charlie.signMessage(ethers.utils.arrayify(hash));

      await utils.shouldThrow(
        subscription.createSubscription(
          charlie.address,
          5,
          charlie.address,
          signedHash
        )
      );
    });

    it("Should not allow wrong value", async () => {
      subscription = subscription.connect(alice);
      const hash = await subscription.getSubscriptionHash(
        charlie.address,
        4,
        dai.address,
        0,
        0
      );

      const signedHash = await charlie.signMessage(ethers.utils.arrayify(hash));

      await utils.shouldThrow(
        subscription.createSubscription(
          charlie.address,
          4,
          dai.address,
          signedHash
        )
      );
    });
  });

  context("With executing subscription", async () => {
    it("Should update timestamp and transfer tokens to contract when executed", async () => {
      dai = dai.connect(alice);
      subscription = subscription.connect(alice);
      await dai.mintTokens(charlie.address);
      const nonce = dai.nonces(charlie.address);

      daiCharlie = dai.connect(charlie);
      await daiCharlie.approve(subscription.address, 1000);

      const hash = await subscription.getSubscriptionHash(
        charlie.address,
        5,
        dai.address,
        0,
        0
      );

      const signedHash = await charlie.signMessage(ethers.utils.arrayify(hash));

      await subscription.createSubscription(
        charlie.address,
        5,
        dai.address,
        signedHash
      );

      var subscriber = await subscription.allSubscribers(1);

      const initialTimestamp = subscriber.nextWithdraw;
      const initialBal = parseInt(await dai.balanceOf(subscription.address));
      console.log(initialBal);
      await subscription.executeSubscription(hash);

      const finalBal = parseInt(await dai.balanceOf(subscription.address));
      console.log(finalBal);

      assert.strictEqual(finalBal - initialBal, 5);

      subscriber = await subscription.allSubscribers(1);
      const finalTimestamp = subscriber.nextWithdraw;

      assert.strictEqual(finalTimestamp - initialTimestamp, 2592000);
    });

    it("Should fail when executed before nextWithdraw", async () => {
      dai = dai.connect(alice);
      subscription = subscription.connect(alice);
      await dai.mintTokens(charlie.address);
      const nonce = dai.nonces(charlie.address);

      daiCharlie = dai.connect(charlie);
      await daiCharlie.approve(subscription.address, 1000);

      const hash = await subscription.getSubscriptionHash(
        charlie.address,
        5,
        dai.address,
        0,
        0
      );

      const signedHash = await charlie.signMessage(ethers.utils.arrayify(hash));

      await subscription.createSubscription(
        charlie.address,
        5,
        dai.address,
        signedHash
      );

      await subscription.executeSubscription(hash);

      await utils.shouldThrow(subscription.executeSubscription(hash));
    });
  });

  xcontext("With modifying subscription status", async () => {
    it("Should allow to change status", async () => {
      dai = dai.connect(alice);
      subscription = subscription.connect(alice);
      await dai.mintTokens(charlie.address);
      const nonce = dai.nonces(charlie.address);

      daiCharlie = dai.connect(charlie);
      await daiCharlie.approve(subscription.address, 1000);

      const hash = await subscription.getSubscriptionHash(
        charlie.address,
        5,
        dai.address,
        0,
        0
      );

      const signedHash = await charlie.signMessage(ethers.utils.arrayify(hash));

      await subscription.createSubscription(
        charlie.address,
        5,
        dai.address,
        signedHash
      );

      var subscriber = await subscription.allSubscribers(1);

      const modifyHash = await subscription.getSubscriptionHash(
        charlie.address,
        5,
        dai.address,
        subscriber.nonce++,
        1 // PAUSED
      );

      const signedModifyHash = await charlie.signMessage(
        ethers.utils.arrayify(modifyHash)
      );

      await subscription.modifySubscription(
        charlie.address,
        5,
        dai.address,
        1, //Paused
        hash,
        signedModifyHash
      );

      subscriber = await subscription.allSubscribers(1);

      assert.strictEqual(parseInt(subscriber.status), 1);
    });

    it("Should throw when status is not active", async () => {
      dai = dai.connect(alice);
      subscription = subscription.connect(alice);
      await dai.mintTokens(charlie.address);
      const nonce = dai.nonces(charlie.address);

      daiCharlie = dai.connect(charlie);
      await daiCharlie.approve(subscription.address, 1000);

      const hash = await subscription.getSubscriptionHash(
        charlie.address,
        5,
        dai.address,
        0,
        0
      );

      const signedHash = await charlie.signMessage(ethers.utils.arrayify(hash));

      await subscription.createSubscription(
        charlie.address,
        5,
        dai.address,
        signedHash
      );

      var subscriber = await subscription.allSubscribers(1);

      const modifyHash = await subscription.getSubscriptionHash(
        charlie.address,
        5,
        dai.address,
        subscriber.nonce++,
        1 // PAUSED
      );

      const signedModifyHash = await charlie.signMessage(
        ethers.utils.arrayify(modifyHash)
      );

      await subscription.modifySubscription(
        charlie.address,
        5,
        dai.address,
        1, //Paused
        hash,
        signedModifyHash
      );

      const oldHashToSubNumber = await subscription.hashToSubscription(hash);
      assert.strictEqual(parseInt(oldHashToSubNumber), 0);

      await utils.shouldThrow(subscription.executeSubscription(hash));
      await utils.shouldThrow(subscription.executeSubscription(modifyHash));
    });

    it("Should execute when status is changed back to active", async () => {
      dai = dai.connect(alice);
      subscription = subscription.connect(alice);
      await dai.mintTokens(charlie.address);
      const nonce = dai.nonces(charlie.address);

      daiCharlie = dai.connect(charlie);
      await daiCharlie.approve(subscription.address, 1000);

      const hash = await subscription.getSubscriptionHash(
        charlie.address,
        5,
        dai.address,
        0,
        0
      );

      const signedHash = await charlie.signMessage(ethers.utils.arrayify(hash));

      await subscription.createSubscription(
        charlie.address,
        5,
        dai.address,
        signedHash
      );

      var subscriber = await subscription.allSubscribers(1);

      const modifyHash = await subscription.getSubscriptionHash(
        charlie.address,
        5,
        dai.address,
        subscriber.nonce++,
        1 // PAUSED
      );

      const signedModifyHash = await charlie.signMessage(
        ethers.utils.arrayify(modifyHash)
      );

      await subscription.modifySubscription(
        charlie.address,
        5,
        dai.address,
        1, //Paused
        hash,
        signedModifyHash
      );

      subscriber = await subscription.allSubscribers(1);

      const activeHash = await subscription.getSubscriptionHash(
        charlie.address,
        5,
        dai.address,
        subscriber.nonce++,
        0 // ACTIVE
      );

      const signedActiveHash = await charlie.signMessage(
        ethers.utils.arrayify(activeHash)
      );

      await subscription.modifySubscription(
        charlie.address,
        5,
        dai.address,
        0, // ACTIVE
        modifyHash,
        signedActiveHash
      );

      await subscription.executeSubscription(activeHash);

      assert.strictEqual(
        parseInt(await dai.balanceOf(subscription.address)),
        5
      );
    });
  });

  xcontext("With contract functions", async () => {
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
        subscription.initialize(bob.address, [dai.address], [5])
      );
    });

    it("Should allow publisher to modify payment tokens and values", async () => {
      subscription = subscription.connect(alice);

      var nonce = parseInt(await subscription.publisherNonce());

      const hash = await subscription.getPublisherModificationHash(
        [dai.address],
        [5, 10, 20],
        nonce++
      );

      const signedHash = await bob.signMessage(ethers.utils.arrayify(hash));

      await subscription.modifyContract([dai.address], [5, 10, 20], signedHash);

      const lastVal = await subscription.acceptedValues(2);

      assert.strictEqual(parseInt(lastVal), 20);
    });
  });
});
