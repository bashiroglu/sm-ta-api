const mongoose = require("mongoose");
const { getCode } = require("../utils/app");

const collectionName = "Group";

const groupSchema = new mongoose.Schema(
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

groupSchema.pre("save", async function (next) {
  if (this.isNew) this.code = await getCode(next, collectionName, "GRP");
});

groupSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const GroupModel = mongoose.model(collectionName, groupSchema);

module.exports = GroupModel;
