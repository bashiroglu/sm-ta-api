const mongoose = require("mongoose");
const { studentPaymentText, salaryText } = require("../utils/contents");
const { notify } = require("../utils/helpers");

const collectionName = "Transaction";

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },

    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "LowerCategory",
    },
    isIncome: {
      type: Boolean,
      required: true,
    },
    balanceAfter: Number,
    balanceBefore: Number,
    relatedToBalanceAfter: Number,
    relatedToBalanceBefore: Number,
    realDate: Date,
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
    },
    hidden: Boolean,
    branch: {
      type: mongoose.Schema.ObjectId,
      ref: "Branch",
    },
    relatedTo: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    internal: {
      type: Boolean,
      default: false,
    },
    paidStudents: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    group: {
      type: mongoose.Schema.ObjectId,
      ref: "Group",
    },

    recurrence: {
      type: mongoose.Schema.ObjectId,
      ref: "Recurrence",
    },
    executed: Boolean,

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
  this.find({ deleted: { $ne: true } }).populate({
    path: "category",
    select: "title",
  });
  next();
});

schema.statics.q = ["title", "code"];

schema.statics.codeOptions = {
  field: collectionName,
};

schema.pre("save", async function (next) {
  if (!this.realDate) this.realDate = new Date();

  next();
});

schema.statics.smsNotification = true;

schema.post("save", async function (doc) {
  await doc.populate("relatedTo").execPopulate();

  const {
    relatedTo: { phoneNumbers },
    amount,
    category,
  } = doc;

  let obj;

  const strCategory = `${category}`;

  if (strCategory === process.env.STUDENT_PAYMENT_CATEGORY_ID)
    obj = {
      via: "sms",
      to: phoneNumbers?.at(-1),
      content: studentPaymentText(amount),
    };
  if (strCategory === process.env.SALARY_CATEGORY_ID)
    obj = {
      via: "email",
      to: phoneNumbers?.at(-1),
      content: salaryText(amount),
    };

  if (!schema.statics.smsNotification && obj.via === "sms") return;
  await notify(obj);
});

module.exports = mongoose.model(collectionName, schema);
