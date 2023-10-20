const mongoose = require("mongoose");
const { getCode } = require("../utils/app");

const collectionName = "Program";

const programSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },

    title: { type: String },
    description: { type: String },
    predictedPayment: {
      type: Number,
    },
    lessonsCount: {
      type: Number,
    },
    permissionsCount: {
      type: Number,
    },
    lessonsDuration: {
      type: Number,
    },
    maxDefaultParticipantCount: Number,

    name: String,
    price: Number,
    subjects: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Subject",
        },
      ],
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

programSchema.pre("save", async function (next) {
  if (this.isNew) this.code = await getCode(next, collectionName, "PRGRM");
});

programSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const ProgramModel = mongoose.model(collectionName, programSchema);

module.exports = ProgramModel;
