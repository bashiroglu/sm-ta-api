const mongoose = require("mongoose");

const collectionName = "Lesson";

const lessonSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
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
    room: {
      type: mongoose.Schema.ObjectId,
      ref: "Room",
    },
    isExtra: Boolean,

    deleted: Boolean,
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

lessonSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } }).populate({
    path: "absent",
    select: "name surname",
  });
  next();
});

const LessonModel = mongoose.model(collectionName, lessonSchema);

module.exports = LessonModel;
