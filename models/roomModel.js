const mongoose = require("mongoose");

const collectionName = "Room";

const roomSchema = new mongoose.Schema(
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
  this.find({ archived: { $ne: true } });
  next();
});

const RoomModel = mongoose.model(collectionName, roomSchema);

module.exports = RoomModel;
