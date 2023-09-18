const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { getCode } = require("../utils/app");
const { uniqueArrValidator } = require("../utils/validators");
const catchAsync = require("../utils/catchAsync");

const collectionName = "user";

const userSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "name is required"],
    },
    surname: {
      type: String,
      required: [true, "surname is required"],
    },
    fatherName: {
      type: String,
    },
    phoneNumbers: {
      required: [true, "At least one phone number required."],
      type: [
        {
          type: String,
          unique: true,
        },
      ],
      validate: uniqueArrValidator,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: 6,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "password confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "password should be the same with passwordConfirm",
      },
    },
    passwordChangedAt: {
      type: Date,
    },
    dateOfBirth: {
      type: Date,
    },
    paswordResetToken: {
      type: String,
    },
    paswordResetTokenExpires: {
      type: Date,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: [true, "email should be lovercased"],
    },
    roles: {
      type: [String],
      default: ["student"],
      enum: {
        values: ["student", "teacher", "manager", "owner", "parent"],
        message: `Roles have to be some of them: "owner", "admin", "manager", "guide", "vendor", "client"`,
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    referalId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    branch: {
      type: mongoose.Schema.ObjectId,
      ref: "branch",
    },
    parent: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    socialMediaProfiles: {
      type: {
        facebook: String,
        instagram: String,
        linkedin: String,
      },
    },
    gender: {
      type: String,
      default: "unknown",
      enum: {
        values: ["male", "female", "unknown", "other"],
        message: "male, female, unknown",
      },
    },
    permissions: [String],
    active: Boolean,
    note: String,
    region: String,
    query: String,
  },
  {
    timestamps: true,
    collation: { locale: "en", strength: 2 },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.pre("save", async function (next) {
  if (this.isNew)
    this.code = await getCode(next, collectionName, "USER", 6);

  const name = this.name ? this.name + " " : "";
  const surname = this.surname ? this.surname + " " : "";
  const note = this.note ? this.note + " " : "";
  const phoneNumbers = this.phoneNumbers.join(" ");

  this.query = `${name}${surname}${note}${phoneNumbers}`;

  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  // if (!this.isModified("password")) return next();
  if (!this.isModified("password") || this.isNew) return next();
  // this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  return next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

userSchema.methods.checkPassword = async function (
  cadidatePassword,
  userPassword,
) {
  return await bcrypt.compare(cadidatePassword, userPassword);
};

userSchema.methods.passwordChanged = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTime = this.passwordChangedAt.getTime() / 1000;
    return passwordChangedTime >= JWTTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.paswordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.paswordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.virtual("fullName").get(function () {
  return this.name + " " + this.surname;
});

const UserModel = mongoose.model(collectionName, userSchema);

module.exports = UserModel;
