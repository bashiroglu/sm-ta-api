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

schema.statics.codeOptions = {
  field: collectionName,
};

module.exports = mongoose.model(collectionName, schema);
