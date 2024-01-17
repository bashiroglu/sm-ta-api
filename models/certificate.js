const mongoose = require("mongoose");

const collectionName = "Certificate";

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      trim: true,
    },
    fullname: {
      type: String,
    },
    studentProfileImageUrl: {
      type: String,
    },
    certificateCoverImageUrl: {
      type: String,
    },
    certificateImageUrl: {
      type: String,
    },
    certificatePdfDownloadUrl: {
      type: String,
    },
    servicesUsed: {
      type: [
        {
          type: String,
          enum: [
            "General English",
            "General English (online)",
            "PRE-IELTS",
            "PRE-IELTS (online)",
            "IELTS",
            "IELTS (online)",
            "Only Speaking",
            "Only Speaking (online)",
            "Speaking Mock Exam",
            "Essay Checking",
            "Duolingo (ənənəvi)",
            "Medical English",
          ],
        },
      ],
    },
    levels: {
      type: [
        {
          type: String,
          enum: [
            "beginner",
            "elementary",
            "pre-intermediate",
            "intermediate",
            "intermediate+",
            "upper-intermediate",
            "advanced",
          ],
        },
      ],
    },
    attendanceHours: {
      type: Number,
    },
    description: {
      type: String,
    },
    homeworkCompletion: {
      type: Number,
    },
    examResults: {
      type: Number,
    },
    startedCourseDate: {
      type: Date,
      equired: [true, "date must be"],
    },
    finishedCourseDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "certificate must be created by a user"],
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

module.exports = mongoose.model(collectionName, schema);
