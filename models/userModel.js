const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { getCode } = require("../utils/app");
const { uniqueArrValidator } = require("../utils/validators");

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
    fatherName: {
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
        values: ["student", "teacher", "manager", "owner", "guardian", "admin"],
        message: `Roles have to be some of them: student, teacher, manager, owner, guardian, admin`,
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    permissions: {
      type: [String],
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
          return this.roles?.includes("student");
        },
        "Student's school admittion year is required.",
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
          ref: "Subjects",
        },
      ],
    },

    active: Boolean,
    note: String,
    description: String,
    query: String,

    archived: Boolean,
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
  if (this.isNew)
    this.code =
      this.email === process.env.OWNER_EMAIL
        ? "OWNER_CODE"
        : await getCode(next, collectionName, "USER", 6);

  const name = this.name ? this.name + " " : "";
  const surname = this.surname ? this.surname + " " : "";
  const note = this.note ? this.note + " " : "";
  const phoneNumbers = this.phoneNumbers.join(" ");

  this.query = `${name}${surname}${note}${phoneNumbers}`;

  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  return next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
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

const UserModel = mongoose.model(collectionName, userSchema);

module.exports = UserModel;
