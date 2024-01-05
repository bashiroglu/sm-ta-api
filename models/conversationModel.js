const mongoose = require("mongoose");

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
      enum: ["waits-register", "filled", "done", "archived"],
      default: "waits-register",
    },
    levels: {
      type: [
        { type: String, enum: ["BEG", "ELE", "PRE", "INT", "INT+", "UPI"] },
      ],
      required: [true, "levels is required"],
    },
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
          participated: Boolean,
          paid: Boolean,
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

const Model = mongoose.model(collectionName, schema);

module.exports = Model;
