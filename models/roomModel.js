const mongoose = require("mongoose");

const collectionName = "Room";

const roomModelSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.ObjectId,
      ref: "Branch",
      required: [true, "Room must belong to a branch"],
    },
    number: {
      type: Number,
    },
    size: {
      type: Number,
    },
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

roomModelSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const RoomModel = mongoose.model(collectionName, roomModelSchema);

module.exports = RoomModel;
