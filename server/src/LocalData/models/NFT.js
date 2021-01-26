var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NFTSchema = new Schema(
  {
    _id: { type: String }, // transaction hash
    metadata: { type: String },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

NFTSchema.virtual("id").get(function () {
  return this._id;
});

module.exports = mongoose.model("NFT", NFTSchema);