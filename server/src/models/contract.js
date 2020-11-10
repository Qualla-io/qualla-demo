var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ContractSchema = new Schema(
  {
    _id: {type: String},
    publisher: {type: String, ref: "User"},
    tiers: {type: [], ref: "Tier"},
    subscribers: {type: [], ref: "User"},
  },
  {
    toObject: {virtuals: true},
    toJSON: {virtuals: true},
  }
);

ContractSchema.virtual("address").get(function () {
  return this._id;
});

module.exports = mongoose.model("Contract", ContractSchema);
