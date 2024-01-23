const mongoose = require("mongoose");
const { homeworkText } = require("../utils/contents");
const { notify } = require("../utils/helpers");

const collectionName = "Homework";

const schema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.ObjectId,
      ref: "Lesson",
      required: [true, "Homework must belong to lesson"],
    },
    exercises: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Exercise",
      },
    ],

    percentage: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },

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

schema.post("save", async function (doc) {
  const {
    student: { tgChatId, email },
  } = await doc.populate("student").execPopulate();

  await notify({
    via: tgChatId ? "telegram" : "email",
    to: tgChatId || email,
    content: homeworkText,
  });
});

module.exports = mongoose.model(collectionName, schema);
