import {UserInputError} from "apollo-server";

import {ethers} from "ethers";

import {getContract, getContracts} from "./contractData";
import {dai, factory, account, SubscriptionV1} from "./utils";

export const resolvers = {
  Query: {
    contract: async (_, {id}) => {
      return await getContract(id.toLowerCase());
    },
    contracts: async () => await getContracts(),
  },
  Mutation: {
    createContract: async (_, {publisher, tiers}) => {
      //  TODO: check if user already has contract

      let values = [];
      for (var i = 0; i < tiers.length; i++) {
        values.push(
          ethers.constants.WeiPerEther.mul(tiers[i].value).toString()
        );
      }

      await factory.createSubscription(publisher, [dai.address], values);
      var address = await factory.getSubscription(publisher.toLowerCase());

      let contract = {};
      contract.id = address.toLowerCase();
      contract.paymentTokens = [dai.address];
      contract.acceptedValues = values;
      contract.publisherNonce = 0;
      contract.tiers = tiers;
      contract.publisher = {};
      contract.publisher.id = publisher.toLowerCase();
      contract.factory = {};
      contract.factory.id = factory.address.toLowerCase();
      contract.factory.fee = await factory.fee();
      contract.subscribers = [];

      return contract;
    },

    modifyContract: async (_, {id, tiers, signedHash}) => {
      // TODO: Test this!
      let _contract = await getContract(id.toLowerCase());

      if (_contract === null) {
        throw new UserInputError("Contract does not exsist", {
          invalidArgs: Object.keys(id),
        });
      }

      var subscriptionV1 = new ethers.Contract(id, SubscriptionV1.abi, account);

      let values = [];
      for (var i = 0; i < tiers.length; i++) {
        values.push(
          ethers.constants.WeiPerEther.mul(tiers[i].value).toString()
        );
      }

      try {
        await subscriptionV1.modifyContract([dai.address], values, signedHash);
      } catch (err) {
        console.log(err);
        throw new UserInputError("Invalid signature or input", {
          invalidArgs: Object.keys(signedHash),
        });
      }

      _contract.paymentTokens = [dai.address];
      _contract.acceptedValues = values;
      _contract.publisherNonce++;

      return _contract;
    },
    fakeSub: async (_, {id}) => {
      let _contract = await getContract(id.toLowerCase());

      if (_contract === null) {
        throw new UserInputError("Contract does not exsist", {
          invalidArgs: Object.keys(id),
        });
      }

      var subscriptionV1 = new ethers.Contract(
        id.toLowerCase(),
        SubscriptionV1.abi,
        account
      );

      var initBal = await dai.balanceOf(account.address);

      initBal = initBal.toString();

      const valLength = _contract.acceptedValues.length;

      let value = _contract.acceptedValues[valLength - 1];
      value = value.toString();

      let allowance = await dai.allowance(account.address, id);
      allowance = allowance.toString();

      let allowed = ethers.BigNumber.from(value);
      allowed = allowed.mul(5);
      allowed = allowed.toString();

      await dai.approve(id, allowed);

      let subscribers = _contract.subscribers;
      // Check if already a subscriber

      let found = false;
      let subscriptionId;
      for (var i = 0; i < subscribers.length; i++) {
        if (account.address.toLowerCase() === subscribers[i].subscriber.id) {
          found = true;
          subscriptionId = subscribers[i].id;
        }
      }

      if (!found) {
        let hash = await subscriptionV1.getSubscriptionHash(
          account.address,
          value,
          dai.address,
          0,
          0
        );

        const signedHash = await account.signMessage(
          ethers.utils.arrayify(hash)
        );

        if (!_contract.subscribers) {
          _contract.subscribers = [];
        }

        let _subscription = {};
        _subscription.id = `${account.address.toLowerCase()}-${_contract.id.toLowerCase()}`;
        _subscription.value = value;
        _subscription.subscriber = {};
        _subscription.subscriber.id = account.address;
        _subscription.subscriber.__typename = "User";
        _subscription.__typename = "SubscriptionObj";

        _contract.subscribers.push(_subscription);

        await subscriptionV1.createSubscription(
          account.address,
          value,
          dai.address,
          signedHash
        );

        return _contract;
      } else {
        return _contract;
      }
    },
    withdraw: async (_, {id}) => {
      let _contract = getContract(id.toLowerCase());

      if (_contract === null) {
        throw new UserInputError("Contract does not exsist", {
          invalidArgs: Object.keys(id),
        });
      }

      var subscriptionV1 = new ethers.Contract(id, SubscriptionV1.abi, account);

      await subscriptionV1.withdraw();

      return true;
    },
    subscribe: async (_, {contractID, userID, value, signedHash}) => {
      let _contract = await getContract(contractID.toLowerCase());

      if (_contract === null) {
        throw new UserInputError("Contract does not exsist", {
          invalidArgs: Object.keys(contractID),
        });
      }

      var subscriptionV1 = new ethers.Contract(
        contractID.toLowerCase(),
        SubscriptionV1.abi,
        account
      );

      // let _subscription = {};
      // _subscription.id = `${userID.toLowerCase()}-${_contract.id.toLowerCase()}`;
      // // _subscription.value = value;
      // _subscription.subscriber = {};
      // _subscription.subscriber.id = userID.toLowerCase();
      // // _subscription.subscriber.__typename = "User";
      // // _subscription.__typename = "SubscriptionObj";

      // _contract.subscribers.push(_subscription);

      await subscriptionV1.createSubscription(
        userID,
        value,
        dai.address,
        signedHash
      );

      return _contract;
    },
  },
  Contract: {
    __resolveReference(contract) {
      return getContract(contract.id);
    },
    publisher: async (contract) => {
      return {__typename: "User", id: contract.publisher.id};
    },
  },
};
