const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { uniqueArrValidator } = require("../utils/validators");
const { roles } = require("../utils/constants/enums");
const { getFirstOfNextMonth } = require("../utils/helpers");

const collectionName = "User";

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
    patronymic: {
      type: String,
    },
    email: {
      type: String,
      // required: [true, "email is required"],
      unique: true,
      lowercase: [true, "email should be lovercased"],
    },
    phoneNumbers: {
      // required: [true, "At least one phone number required."],
      type: [
        {
          type: String,
          unique: true,
        },
      ],
      validate: uniqueArrValidator,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      default: "unknown",
      enum: {
        values: ["male", "female", "unknown"],
        message: "male, female",
      },
    },
    profileImage: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
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
    paswordResetToken: {
      type: String,
    },
    paswordResetTokenExpires: {
      type: Date,
    },

    roles: {
      type: [String],
      enum: {
        values: roles.values(),
        message: `Roles have to be some of them: ${roles.values().join(", ")}`,
      },
    },
    tags: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "LowerCategory",
        },
      ],
      default: [],
    },
    permissions: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "LowerCategory",
        },
      ],
      default: [],
    },

    referalId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    socialMediaProfiles: {
      type: {
        facebook: String,
        instagram: String,
        linkedin: String,
      },
    },
    nextPaymentDate: {
      type: Date,
      default: function () {
        return this.roles.includes(roles.STUDENT)
          ? getFirstOfNextMonth()
          : undefined;
      },
    },

    relationship: {
      type: String,
      enum: ["father", "mother", "other"],
      required: [
        function () {
          return !!this.guardian;
        },
        'Guardian"s repationship field is reuqired.',
      ],
    },

    // Groups of degree programs (ixtisas qrupu)
    groupDP: Number,
    guardian: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    schoolAdmittionYear: {
      type: Number,
      required: [
        function () {
          return this.roles?.includes(roles.STUDENT);
        },
        "Student's school admittion year is requi`${roles.musts to the next payment date.d.",
      ],
    },
    packages: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Package",
        },
      ],
    },

    subjects: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Subject",
        },
      ],
      validate: {
        validator: function (val) {
          return !this.roles.includes(roles.TEACHER) || val.length;
        },
        message: "Teacher must have at least one subject.",
      },
    },

    active: {
      type: Boolean,
      default: true,
    },
    deleted: Boolean,
    description: String,

    note: { type: String, select: false },
    query: { type: String, select: false },

    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collation: { locale: "en", strength: 2 },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  this.query = [
    this.name && "",
    this.surname && "",
    this.note && "",
    this.phoneNumbers.join(" ") && "",
  ].join(" ");

  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  return next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });

  next();
});

userSchema.methods.checkPassword = async function (
  cadidatePassword,
  userPassword
) {
  return await bcrypt.compare(cadidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
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

userSchema.virtual("groups", {
  ref: "Group",
  foreignField: "students",
  localField: "_id",
});

userSchema.virtual("absents", {
  ref: "Lesson",
  foreignField: "absent",
  localField: "_id",
});

userSchema.virtual("branches", {
  ref: "Branch",
  foreignField: "managers",
  localField: "_id",
});

const UserModel = mongoose.model(collectionName, userSchema);

module.exports = UserModel;
