import User from "../models/user";
import Contract from "../models/contract";
import {DataSource} from "apollo-datasource";

class LocalDataAPI extends DataSource {
  async getContracts(lean = true) {
    if (lean) {
      return await Contract.find({}).lean();
    } else {
      return await Contract.find({});
    }
  }
  async getContract(id, lean = true) {
    if (lean) {
      return await Contract.findById(id.toLowerCase()).lean();
    } else {
      return await Contract.findById(id.toLowerCase());
    }
  }

  async getUsers(lean = true) {
    if (lean) {
      return await User.find({}).lean();
    } else {
      return await User.find({});
    }
  }

  async getUser(id, lean = true) {
    if (lean) {
      return await User.findById(id.toLowerCase()).lean();
    } else {
      return await User.findById(id.toLowerCase());
    }
  }
}

export default LocalDataAPI;
