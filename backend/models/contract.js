var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ContractSchema = new Schema(
  {
    _id: {type: String},
    publisher: {type: String, ref: "Publisher"},
    tiers: {type: [], ref: "Tier"},
    subscribers: {type: [], ref: "Subscriber"},
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
