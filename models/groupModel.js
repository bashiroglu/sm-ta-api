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

    detailCode: {
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
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
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
    startTime: {
      type: Number,
      min: 0,
      max: 1439,
    },
    endTime: {
      type: Number,
      min: 0,
      max: 1439,
    },
    status: {
      type: String,
      enum: {
        values: ["due", "active", "archive"],
        message: "enum_group_status",
      },
    },
    level: {
      type: mongoose.Schema.ObjectId,
      ref: "LowerCategory",
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

schema.virtual("enrollments", {
  ref: "Enrollment",
  foreignField: "group",
  localField: "_id",
});

schema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

schema.statics.studentsPopOpts = {
  path: "enrollments",
  select: "student lessonCount permissionCount",
  populate: { path: "student", select: "id name surname code email" },
  match: { status: "active" },
  transform: ({
    _id,
    student: { id, name, surname, code, email },
    lessonCount,
    permissionCount,
    status,
  }) => ({
    id,
    name,
    surname,
    code,
    email,
    enrollment: _id,
    lessonCount,
    permissionCount,
    status,
  }),
};

schema.statics.q = ["name"];

schema.pre("save", async function (next) {
  const room = await RoomModel.findById(this.room);
  if (!room) return next(new AppError("room_not_found", 404));

  next();
});

schema.post("save", async function (doc) {
  await doc.populate(schema.statics.studentsPopOpts).execPopulate();
});

schema.statics.codeOptions = {
  field: collectionName,
};

module.exports = mongoose.model(collectionName, schema);
