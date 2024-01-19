const mongoose = require("mongoose");

const collectionName = "PlacementMeeting";

const schema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.ObjectId,
      ref: "Room",
    },
    candidate: {
      type: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        patronymic: { type: String },
        phoneNumber: { type: String, required: true },
      },
      required: true,
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    dateTime: Date,

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
