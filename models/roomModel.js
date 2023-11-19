const mongoose = require("mongoose");

const collectionName = "Room";

const roomSchema = new mongoose.Schema(
  {
    name: String,
    branch: {
      type: mongoose.Schema.ObjectId,
      ref: "Branch",
      required: [true, "required_branch"],
    },
    number: {
      type: Number,
    },
    size: {
      type: Number,
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

roomSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } }).populate({
    path: "branch",
    select: "name -managers",
  });
  next();
});

const RoomModel = mongoose.model(collectionName, roomSchema);

module.exports = RoomModel;
