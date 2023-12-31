const mongoose = require("mongoose");

const collectionName = "Lesson";

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    group: {
      type: mongoose.Schema.ObjectId,
      ref: "Group",
      required: [true, "required_group"],
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "required_teacher"],
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
    studentState: [
      {
        student: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        lessonCount: Number,
        permissionCount: {
          type: Number,
          default: 1,
        },
        status: {
          type: String,
          enum: ["active", "inactive"],
          default: "active",
        },
      },
    ],

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
  this.find({ deleted: { $ne: true } }).populate({
    path: "absent",
    select: "name surname",
  });

  next();
});

schema.statics.q = ["topic", "code"];

const Model = mongoose.model(collectionName, schema);

module.exports = Model;
