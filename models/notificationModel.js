const mongoose = require("mongoose");

const collectionName = "Notification";

const schema = new mongoose.Schema(
  {
    from: String,
    to: String,
    content: String,
    type: {
      type: String,
      enum: ["sms", "telegram", "email", "push"],
    },
    result: Object,

    deleted: Boolean,
    archived: Boolean,
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

schema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

module.exports = mongoose.model(collectionName, schema);
