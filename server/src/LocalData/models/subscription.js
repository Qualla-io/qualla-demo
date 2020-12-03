var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SubscriptionSchema = new Schema(
  {
    subscriber: {type: String},
    value: {type: Number},
    token: {type: String},
    status: {type: Number},
    hash: {type: String},
    signedHash: {type: String},
    nextWithdrawl: {type: Number},
    contract: {type: String},
  },
  {
    toObject: {virtuals: true},
    toJSON: {virtuals: true},
  }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
