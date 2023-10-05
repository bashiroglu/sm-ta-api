const mongoose = require("mongoose");
const { getCode } = require("../utils/app");

const collectionName = "Category";

const categorySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },

    name: { type: String },
    description: { type: String },

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

categorySchema.pre("save", async function (next) {
  if (this.isNew) this.code = await getCode(next, collectionName, "CTGRY");
});

categorySchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const ExamModel = mongoose.model(collectionName, categorySchema);

module.exports = ExamModel;
