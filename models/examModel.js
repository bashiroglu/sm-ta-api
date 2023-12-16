const mongoose = require("mongoose");

const collectionName = "Exam";

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "required_name"],
    },
    type: {
      type: String,
      enum: {
        values: ["b9", "b11", "q"],
        message: "enum_exam_type",
      },
      required: [true, "required_exam_type"],
    },
    date: Date,
    subjects: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Subject",
        },
      ],
    },
    participants: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
      ],
    },

    query: { type: String, select: false },
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

schema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

schema.statics.queryFields = ["code"];

schema.pre("save", async function (next) {
  next();
});

const Model = mongoose.model(collectionName, schema);

module.exports = Model;
