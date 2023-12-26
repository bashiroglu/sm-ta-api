const mongoose = require("mongoose");

const collectionName = "Program";

const programSchema = new mongoose.Schema(
  {
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
    // subjects: {
    //   type: [
    //     {
    //       type: mongoose.Schema.ObjectId,
    //       ref: "Subject",
    //     },
    //   ],
    // },

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

programSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const ProgramModel = mongoose.model(collectionName, programSchema);

module.exports = ProgramModel;
