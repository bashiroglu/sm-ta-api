const mongoose = require("mongoose");

const collectionName = "Company";

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "required_name."],
    },
    balance: { type: Number, default: 0 },

    blog: { type: Number, default: 0 },
    book: { type: Number, default: 0 },
    conversation: { type: Number, default: 0 },
    feedback: { type: Number, default: 0 },
    group: { type: Number, default: 0 },
    inventory: { type: Number, default: 0 },
    lesson: { type: Number, default: 0 },
    sale: { type: Number, default: 0 },
    transaction: { type: Number, default: 0 },
    user: { type: Number, default: 0 },

    isUnderConstruction: {
      type: Boolean,
      default: false,
    },

    website: String,
    phoneNumbers: [
      {
        type: String,
        unique: true,
        sparse: true,
      },
    ],
    socialMediaProfiles: {
      type: {
        facebook: String,
        instagram: String,
        linkedin: String,
        telegram: String,
        twitter: String,
      },
    },
    address: String,

    active: Boolean,
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

schema.statics.codeOptions = {
  field: collectionName,
};

module.exports = mongoose.model(collectionName, schema);
