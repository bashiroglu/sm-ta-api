const mongoose = require("mongoose");
const { homeworkText } = require("../utils/contents");
const { notify } = require("../utils/helpers");

const collectionName = "Lesson";

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    group: {
      type: mongoose.Schema.ObjectId,
      ref: "Group",
      required: [true, "required_group"],
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "required_teacher"],
    },
    participations: [
      {
        student: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        absent: Boolean,
        latency: Number,
      },
    ],
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      required: true,
    },

    // TODO: In future versions topics also can be gotten from a Topic Module.
    topic: {
      type: String,
    },

    exercises: [
      {
        exercise: {
          type: mongoose.Schema.ObjectId,
          ref: "Exercise",
        },
        percentage: {
          type: Number,
        },
      },
    ],
    room: {
      type: mongoose.Schema.ObjectId,
      ref: "Room",
    },
    isExtra: Boolean,

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

schema.virtual("duration").get(function () {
  return this.sendedAt - this.tartedAt;
});

schema.virtual("homeworks", {
  ref: "Homework",
  foreignField: "lesson",
  localField: "_id",
});

schema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

schema.post("findOneAndUpdate", async function (doc) {
  const update = this._update;
  if (!("exercises" in update)) return;
  const { homeworks } = await doc
    .populate({ path: "homeworks", populate: "student" })
    .execPopulate();

  if (!homeworks?.length) return;
  homeworks.forEach(async (homework) => {
    const { student } = homework;
    if (!student) return;
    const { tgChatId, email } = student;
    await notify({
      via: tgChatId ? "telegram" : "email",
      to: tgChatId || email,
      content: homeworkText,
    });
  });
});

schema.statics.q = ["topic", "code"];

schema.statics.codeOptions = {
  field: collectionName,
};

module.exports = mongoose.model(collectionName, schema);
