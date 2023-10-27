const mongoose = require("mongoose");
const collectionName = "PlacementMeetingResult";

const placementMeetingResultSchema = new mongoose.Schema(
  {
    placementMeeting: {
      type: mongoose.Schema.ObjectId,
      ref: "PlacementMeeting",
    },
    note: String,
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    proficiency: {
      type: String,
      enum: {
        values: ["A1", "A2", "B1", "B2", "C1", "C2"],
        message: "Proficiency must be one of these: A1, A2, B1, B2, C1, C2",
      },
    },

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

placementMeetingResultSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const PlacementMeetingResultModel = mongoose.model(
  collectionName,
  placementMeetingResultSchema
);

module.exports = PlacementMeetingResultModel;
