const mongoose = require("mongoose");

const collectionName = "PlacementMeeting";

const placementMeetingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.ObjectId,
      ref: "Room",
    },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    dateTime: Date,

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

placementMeetingSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const PlacementMeetingModel = mongoose.model(
  collectionName,
  placementMeetingSchema
);

module.exports = PlacementMeetingModel;
