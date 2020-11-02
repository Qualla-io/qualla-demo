var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PublisherSchema = new Schema(
  {
    _id: { type: String },
    // contracts: [{ type: String, ref: "Contract" }],
    username: {type: String}
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

PublisherSchema.virtual("address").get(function () {
  return this._id;
});

module.exports = mongoose.model("Publisher", PublisherSchema);
