const mongoose = require("mongoose");

const collectionName = "Lesson";

const lessonModelSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.ObjectId,
      ref: "Group",
      required: [true, "Lesson must belong to a group"],
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Lesson must have a teacher"],
    },
    present: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    absent: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    subject: {
      type: mongoose.Schema.ObjectId,
      ref: "Subject",
    },
    // TODO: In future versions topics also can be gotten from a Topic Module.
    topic: {
      type: String,
    },
    isAdditional: Boolean,

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

lessonModelSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const LessonModel = mongoose.model(collectionName, lessonModelSchema);

module.exports = LessonModel;
