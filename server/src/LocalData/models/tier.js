var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var TierSchema = new Schema(
  {
    id: {type: Schema.Types.ObjectId},
    perks: {type: String},
    title: {type: String},
    value: {type: Number},
  },
  {
    toObject: {virtuals: true},
    toJSON: {virtuals: true},
  }
);

// TierSchema.virtual("id").get(function () {
//   return this._id;
// });


module.exports = mongoose.model("Tier", TierSchema);
