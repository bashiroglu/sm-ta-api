const mongoose = require("mongoose");

const collectionName = "Room";

const roomSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },

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

roomSchema.pre("save", async function (next) {
  if (this.isNew) this.code = await getCode(next, collectionName, "ROOM");
});

roomSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const RoomModel = mongoose.model(collectionName, roomSchema);

module.exports = RoomModel;
