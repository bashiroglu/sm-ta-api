const mongoose = require("mongoose");
const { oneLessonRemainedText } = require("../utils/contents");
const { notify } = require("../utils/helpers");
const collectionName = "Enrollment";
const schema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.ObjectId,
      ref: "Group",
      required: true,
    },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    lessonCount: {
      type: Number,
    },
    permissionCount: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    history: [
      {
        lesson: {
          type: mongoose.Schema.ObjectId,
          ref: "Lesson",
        },
        lessonCount: Number,
        permissionCount: Number,
        status: String,
      },
    ],

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

schema.index({ student: 1, group: 1 }, { unique: true });

schema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

schema.pre("save", function (next) {
  this.lessonCountModified = this.isModified("lessonCount");
  next();
});

schema.post("save", async function (doc) {
  if (this.lessonCountModified) {
    const { lessonCount, group, student } = doc;

    if (lessonCount === 1 && group.program.monthly) {
      await notify({
        via: "sms",
        to: student?.phoneNumbers?.at(-1),
        content: oneLessonRemainedText,
      });
    }
  }
});

module.exports = mongoose.model(collectionName, schema);
