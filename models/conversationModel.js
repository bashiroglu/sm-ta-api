const mongoose = require("mongoose");
const {
  getPeriod,
  scheduleTask,
  sendNotification,
} = require("../utils/helpers");

const collectionName = "Conversation";

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },

    description: {
      type: String,
    },
    topic: {
      type: String,
    },
    status: {
      type: String,
      enum: ["open", "close", "occured", "completed"],
      default: "open",
    },
    levels: [
      {
        type: String,
        enum: ["BEG", "ELE", "PRE", "INT", "INT+", "UPI"],
        validate: {
          validator: (v) => {
            console.log("😀😀😀", v, "😀😀😀");
          },
        },
      },
    ],
    maxLimit: {
      type: Number,
      required: [true, "maxLimit is required"],
    },
    teachers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "teacher is required"],
      },
    ],
    observers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    participants: {
      type: [
        {
          participant: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
          },
          participated: {
            type: Boolean,
            default: false,
          },
          paid: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [],
    },
    waitingList: [
      {
        studentId: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
      },
    ],
    date: {
      type: Date,
      required: [true, "date must be"],
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

schema.post("save", async function (doc) {
  // TODO: send sms
  const popdoc = await doc
    .populate({ path: "createdBy", select: "name surname email" })
    .execPopulate();
  console.log("notify teacher and all students", popdoc);
  doc.createdBy = doc.createdBy.id;
});

schema.statics.jobs = {};

schema.post("findOneAndUpdate", async function (doc) {
  if (doc.participants.length === doc.maxLimit && doc.status === "open") {
    doc.status = "close";
    await doc.save();
  }

  if (doc.participants.length < doc.maxLimit && doc.status === "close") {
    while (true) {
      if (!doc.waitingList.length) {
        doc.status = "open";
        breake;
      }
      let participant = doc.waitingList.shift();
      doc.participants = [...doc.participants, { participant }];
      participant = await UserModel.findById(participant);
      if (participant) {
        breake;
        // TODO: notify participant
        console.log(participant);
      }
    }
    await doc.save();
  } else schema.statics.jobs[doc.id] = scheduleTask(doc, sendNotification);

  // Schedule or stop notification job
  if (doc.deleted) schema.statics.jobs[doc.id].stop();
  else
    schema.statics.jobs[doc.id] = scheduleTask(
      doc,
      sendNotification,
      getPeriod(d.date)
    );
  console.log(schema.statics.jobs);
});

schema.post("deleteOne", function (doc) {
  // Stop notification job
  schema.statics.jobs[doc.id].stop();
});

const Model = mongoose.model(collectionName, schema);

module.exports = Model;
