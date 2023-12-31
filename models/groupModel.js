const mongoose = require("mongoose");
const RoomModel = require("./roomModel");
const AppError = require("../utils/appError");

const collectionName = "Group";

const schema = new mongoose.Schema(
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
    program: {
      type: mongoose.Schema.ObjectId,
      ref: "Program",
      required: [true, "required_branch"],
    },
    name: {
      type: String,
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    students: [
      {
        student: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        lessonCount: {
          type: Number,
          default: 0,
        },
        permissionCount: {
          type: Number,
          default: 1,
        },
        status: {
          type: String,
          enum: ["active", "inactive"],
          default: "active",
        },
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

schema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

schema.statics.q = ["name"];

schema.pre("save", async function (next) {
  const room = await RoomModel.findById(this.room);
  if (!room) return next(new AppError("room_not_found", 404));

  next();
});

const Model = mongoose.model(collectionName, schema);

module.exports = Model;
