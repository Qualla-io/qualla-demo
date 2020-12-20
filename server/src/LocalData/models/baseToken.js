var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BaseTokenSchema = new Schema(
  {
    _id: { type: String }, // transaction hash
    description: { type: String },
    title: { type: String },
    avatarID: { type: Number },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

BaseTokenSchema.virtual("id").get(function () {
  return this._id;
});

module.exports = mongoose.model("BaseToken", BaseTokenSchema);
