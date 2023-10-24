const mongoose = require("mongoose");
const { getCode } = require("../utils/app");

const collectionName = "Group";

const groupSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },

    branch: {
      type: mongoose.Schema.ObjectId,
      ref: "Branch",
      required: [true, "Group must belong to a branch"],
    },
    name: {
      type: String,
      required: true,
      unique: true,
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
    room: {
      type: mongoose.Schema.ObjectId,
      ref: "Room",
    },
    program: {
      type: mongoose.Schema.ObjectId,
      ref: "Program",
    },
    weekdays: {
      type: String,
      validate: {
        validator: function (val) {
          if (val.length > 7 || new Set("1123".split("")).size !== val.length)
            return false;
          return !/[^1-7]/.test(val);
        },
        message: "Weekdays validation failed.",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["active", "deactive"],
        message: "Status must be active, deactive",
      },
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

groupSchema.pre("save", async function (next) {
  if (this.isNew) this.code = await getCode(next, collectionName, "GRP");
});

groupSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const GroupModel = mongoose.model(collectionName, groupSchema);

module.exports = GroupModel;
