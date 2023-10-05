const mongoose = require("mongoose");
const { getCode } = require("../utils/app");

const collectionName = "Placement";

const placementSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.ObjectId,
      ref: "Branch",
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

placementSchema.pre("save", async function (next) {
  if (this.isNew) this.code = await getCode(next, collectionName, "BOOK", 8);
});

placementSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const PlacementModel = mongoose.model(collectionName, placementSchema);

module.exports = PlacementModel;
