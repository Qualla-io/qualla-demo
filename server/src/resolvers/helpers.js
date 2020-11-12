import Contract from "../models/contract";
import User from "../models/user";
import {
  getContract,
  getContracts,
  getUser,
  getUsers,
} from "../datasources/contractData";

import merge from "lodash.merge";

export async function getUserById(id) {
  let user = await getUser(id.toLowerCase());

  if (!user) {
    return user;
  }

  // pull from local data
  let _user = await User.findById(id.toLowerCase()).lean();
  // .populate("contract")

  if (_user) {
    user = merge(_user, user);
  }

  return user;
}

export async function getContractById(id) {
  let contract = await getContract(id.toLowerCase());
  if (!contract) {
    return contract;
  }

  // Pull from local data
  let _contract = await Contract.findById(id.toLowerCase()).lean();

  // Stitch
  if (_contract) {
    contract = merge(_contract, contract);
  }

  return contract;
}
