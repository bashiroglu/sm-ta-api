const mongoose = require("mongoose");

const collectionName = "Group";

const groupModelSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.ObjectId,
      ref: "Branch",
      required: [true, "Group must belong to a branch"],
    },
    name: {
      type: String,
    },
    teachers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    students: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
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

groupModelSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const GroupModel = mongoose.model(collectionName, groupModelSchema);

module.exports = GroupModel;
