const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { roles } = require("../utils/constants/enums");

const collectionName = "User";

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
    surname: {
      type: String,
      required: [true, "required_surname"],
    },
    patronymic: {
      type: String,
    },
    initial: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: function (val) {
          if (this.roles.includes(roles.EMPLOYEE)) return val;
          else true;
        },
        message: "",
      },
    },
    email: {
      type: String,
      // required: [true, "email is required"],
      unique: true,
      sparse: true,
      lowercase: [true, "lovercased_email"],
    },
    phoneNumbers: [
      {
        type: String,
        unique: true,
        sparse: true,
      },
    ],
    tgChatId: [String],
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      default: "unknown",
      enum: {
        values: ["male", "female", "unknown"],
        message: "enum_user_gender",
      },
    },
    profileImage: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },

    password: {
      type: String,
      required: [true, "required_password"],
      minlength: 6,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "required_password_confirm"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "confirm_password",
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
        message: `enum_user_roles`,
      },
    },
    positions: {
      type: [mongoose.Schema.ObjectId],
      ref: "LowerCategory",
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

    balance: {
      type: Number,
      default: 0,
    },

    earnings: [
      {
        program: {
          type: mongoose.Schema.ObjectId,
          ref: "Program",
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],

    active: {
      type: Boolean,
      default: true,
    },
    deleted: Boolean,
    description: String,

    note: { type: String, select: false },

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

schema.virtual("fullName").get(function () {
  return this.name + " " + this.surname;
});

schema.virtual("enrollments", {
  ref: "Enrollment",
  foreignField: "student",
  localField: "_id",
});

schema.virtual("branches", {
  ref: "Branch",
  foreignField: "managers",
  localField: "_id",
});

schema.virtual("lessons", {
  ref: "Lesson",
  foreignField: "teacher",
  localField: "_id",
});

schema.virtual("teacherGroups", {
  ref: "Group",
  foreignField: "teacher",
  localField: "_id",
});

schema.virtual("transactions", {
  ref: "Transaction",
  foreignField: "relatedTo",
  localField: "_id",
});

schema.statics.q = [
  "name",
  "surname",
  "patronymic",
  "note",
  "email",
  "code",
  "phoneNumbers",
];

schema.statics.codeOptions = {
  field: collectionName,
  modifier: "",
};

schema.methods.checkPassword = async function (cadidatePassword, userPassword) {
  return await bcrypt.compare(cadidatePassword, userPassword);
};

schema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTime = this.passwordChangedAt.getTime() / 1000;
    return passwordChangedTime >= JWTTimeStamp;
  }
  return false;
};

schema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.paswordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.paswordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

schema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

module.exports = mongoose.model(collectionName, schema);
