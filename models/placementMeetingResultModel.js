const mongoose = require("mongoose");
const collectionName = "PlacementMeetingResult";

const placementMeetingResultSchema = new mongoose.Schema(
  {
    placementMeeting: {
      type: mongoose.Schema.ObjectId,
      ref: "PlacementMeeting",
    },
    availableSlots: [
      {
        weekday: {
          type: Number,
          min: 1,
          max: 7,
          required: true,
        },
        startTime: {
          type: Date,
          required: true,
        },
        endTime: {
          type: Date,
          required: true,
        },
      },
    ],

    level: {
      type: mongoose.Schema.ObjectId,
      ref: "LowerCategory",
    },
    personality: {
      type: mongoose.Schema.ObjectId,
      ref: "LowerCategory",
    },
    hduhau: {
      type: mongoose.Schema.ObjectId,
      ref: "LowerCategory",
    },
    status: {
      type: mongoose.Schema.ObjectId,
      ref: "LowerCategory",
    },
    type: {
      type: mongoose.Schema.ObjectId,
      ref: "LowerCategory",
    },
    referal: String,
    referalUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    note: String,

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
  this.find({ archived: { $ne: true } }).populate("referalUser");
  next();
});

placementMeetingResultSchema.pre("save", function (next) {
  if (mongoose.isValidObjectId(this.referal)) {
    this.referalUser = this.referal;
    this.referal = undefined;
  }

  next();
});

const PlacementMeetingResultModel = mongoose.model(
  collectionName,
  placementMeetingResultSchema
);

module.exports = PlacementMeetingResultModel;
