const mongoose = require("mongoose");

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
      required: [true, "required_branch"],
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
    room: {
      type: mongoose.Schema.ObjectId,
      ref: "Room",
    },
    weekdays: {
      type: String,
      validate: {
        validator: function (val) {
          if (val.length > 7 || new Set(val.split("")).size !== val.length)
            return false;
          return !/[^1-7]/.test(val);
        },
        message: "invalid_weekdays",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["active", "deactive"],
        message: "enum_group_status",
      },
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

groupSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } }).populate([
    {
      path: "room",
      select: "name",
    },
    {
      path: "branch",
      select: "name",
    },
  ]);
  next();
});

const GroupModel = mongoose.model(collectionName, groupSchema);

module.exports = GroupModel;
