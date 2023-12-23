const mongoose = require("mongoose");

const collectionName = "Feedback";

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    lesson: {
      type: mongoose.Schema.ObjectId,
      ref: "Lesson",
    },
    title: String,
    content: String,
    isRead: Boolean,

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

schema.statics.q = ["topic", "code"];

schema.pre("save", async function (next) {
  next();
});

const Model = mongoose.model(collectionName, schema);

module.exports = Model;
