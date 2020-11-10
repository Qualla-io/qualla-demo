var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var TierSchema = new Schema(
  {
    perks: {type: String},
    title: {type: String},
    value: {type: Number},
  },
  {
    toObject: {virtuals: true},
    toJSON: {virtuals: true},
  }
);

module.exports = mongoose.model("Tier", TierSchema);
