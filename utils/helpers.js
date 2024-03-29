const fs = require("fs");
const cron = require("node-cron");

const CompanyModel = require("../models/companyModel");
const LogModel = require("../models/logModel");
const NotificationModel = require("../models/notificationModel");
const catchAsync = require("./catchAsync");
const mongoose = require("mongoose");
const AppError = require("./appError");
const Email = require("./email");
const { sendSmsRequest } = require("./sms");
// const bot = require("../bot");

const getFirstOfNextMonth = () => {
  const currentDate = new Date();
  const nextMonth = new Date(currentDate);
  nextMonth.setMonth(currentDate.getMonth() + 1);
  nextMonth.setDate(2);
  nextMonth.setHours(0, 0, 0, 0);
  return nextMonth;
};

const getCurrentMonth = () => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setMonth(end.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const filterObject = (obj, ...fields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const getDirFileNames = (dirPath) =>
  fs.readdirSync(dirPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    return files.filter((file) => fs.statSync(dirPath + "/" + file).isFile());
  });

const populate = (popOptions, fields) =>
  catchAsync(async (req, res, next) => {
    req.popOptions = popOptions;
    if (fields) req.query.fields = fields;
    next();
  });

const isAggregate = (that) => that.query instanceof mongoose.Aggregate;

const sendNotification = (doc) => {
  console.warn(
    "Task executed at:",
    new Date(),
    doc.title
    // document.recipients
  );
};

const scheduleTask = (document, task, period) =>
  cron.schedule(period || document.periodicity, task.bind(null, document));

const restrictPerSubdomain = (user, req) => {
  if (process.env.NODE_ENV.trim() !== "production") return false;
  // TODO: fix these urls
  return user.roles.includes("student")
    ? ![
        process.env.STUDENT_SUBDOMAIN,
        process.env.NODE_ENV === "development" && process.env.LOCALHOST,
      ].includes(req.get("origin"))
    : user.roles.includes("teacher") &&
        [
          process.env.TEACHER_SUBDOMAIN,
          process.env.NODE_ENV === "development" && process.env.LOCALHOST,
        ].includes(req.get("origin"));
};

const archive = catchAsync(async (req, res, next) => {
  const field = req.url.split("/").at(-1);
  if (!["archive", "unarchive"].includes(field))
    return next(new AppError("dont_use_this_endpoint", 400));

  req.body = { archived: field === "archive" };
  req.query.fields = "archived";
  next();
});

const makeDeleted = catchAsync(async (req, res, next) => {
  req.body = {
    deleted: true,
    makeDeleted: process.env.MAKE_DELETED_SECRET,
  };
  req.deleted = true;
  next();
});

const haveCommon = (array1, array2) =>
  array1.filter((el) => array2.includes(el)).length;

const getPeriod = (date) => `0 10 ${date.getDate()} ${date.getMonth() + 1} *`;

const activate = catchAsync(async (req, res, next) => {
  req.body = { status: "active" };
  next();
});

const deactivate = catchAsync(async (req, res, next) => {
  req.body = { status: "inactive" };
  next();
});

const sendRes = catchAsync(async (req, res, next) => {
  const {
    session,
    status = 200,
    resObj,
    doc,
    user,
    originalUrl,
    method,
    body,
  } = req;

  if (["PATCH", "PUT", "DELETE"].includes(method))
    await LogModel.create(
      [
        {
          oldDoc: doc,
          body,
          originalUrl,
          createdBy: user.id,
        },
      ],
      { session }
    );

  if (session) {
    await session.commitTransaction();
    session.endSession();
  }

  res.status(status).json({
    status: "success",
    ...resObj,
  });
});

const getCode = async (Model, session) => {
  // TODO: Fix for multiple document creation
  let { field, modifier, digitCount = 4 } = Model.schema.statics.codeOptions;
  field = field.toLowerCase();

  const COMPANY_ID = process.env.COMPANY_ID;
  if (!COMPANY_ID) return;

  const company = await CompanyModel.findByIdAndUpdate(
    COMPANY_ID,
    { $inc: { [field]: 1 } },
    { session }
  );

  if (!company) return;

  const codeCount = company[field];

  const code = `${company.code}${modifier ?? field.toUpperCase()}${"0".repeat(
    digitCount - `${codeCount}`.length
  )}${codeCount + 1}`;

  return code;
};

const startTransSession = async (req) => {
  let { session } = req;
  if (session) return session;
  session = await mongoose.startSession();
  session.startTransaction();
  if (req) req.session = session;
  return session;
};

const notify = async (obj) => {
  if (!obj) return;
  const { via, to, content } = obj;
  let result = true;
  if (process.env.NODE_ENV.trim() === "production") {
    if (via === "sms") result = await sendSmsRequest(to, content);
    if (via === "email")
      result = await new Email(newUser, url).send(content, subject);
    // if (via === "telegram") result = await bot.api.sendMessage(to, content);
    // if (via === "push") result = ;

    if (result) await NotificationModel.create([{ via, to, content, result }]);
  }

  console.log(obj);
};

module.exports = {
  getDirFileNames,
  getFirstOfNextMonth,
  filterObject,
  populate,
  isAggregate,
  getCurrentMonth,
  sendNotification,
  scheduleTask,
  restrictPerSubdomain,
  archive,
  makeDeleted,
  haveCommon,
  getPeriod,
  activate,
  deactivate,
  sendRes,
  getCode,
  startTransSession,
  notify,
};
