var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NFTSchema = new Schema(
  {
    _id: { type: String }, // uriID
    metadata: { type: String },
    title: { type: String },
    description: { type: String },
    gifIndex: { type: Number },
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
