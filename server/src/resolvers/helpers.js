import Contract from "../models/contract";
import User from "../models/user";
import {getContract} from "../datasources/contractData";
import {getUser} from "../datasources/userData";

import merge from "lodash.merge";

export async function getUserById(id) {
  let user = await getUser(id.toLowerCase());

  if (!user) {
    return user;
  }

  console.log(user);

  // pull from local data
  let _user = await User.findById(id.toLowerCase()).lean();
  // .populate("contract")

  if (_user) {
    user = merge(_user, user);
  }

  console.log(_user);

  console.log(user);

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
