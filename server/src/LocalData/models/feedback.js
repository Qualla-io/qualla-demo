var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var FeedbackSchema = new Schema(
  {
    _id: { type: mongoose.Types.ObjectId }, 
    user: { type: String },
    feedback: { type: String },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

FeedbackSchema.virtual("id").get(function () {
  return this._id;
});

module.exports = mongoose.model("Feedback", FeedbackSchema);
