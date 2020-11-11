var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    _id: {type: String},
    username: {type: String},
    // contract: {type: String, ref: "Contract"},
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
