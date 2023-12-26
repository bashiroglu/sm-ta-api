const mongoose = require("mongoose");

const collectionName = "Availability";

const availabilitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
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
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "LowerCategory",
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

availabilitySchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const AvailabilityModel = mongoose.model(collectionName, availabilitySchema);

module.exports = AvailabilityModel;
