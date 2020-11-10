var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    _id: {type: String},
    // contracts: [{ type: String, ref: "Contract" }],
    username: {type: String},
  },
  {
    toObject: {virtuals: true},
    toJSON: {virtuals: true},
  }
);

UserSchema.virtual("address").get(function () {
  return this._id;
});

module.exports = mongoose.model("User", UserSchema);
