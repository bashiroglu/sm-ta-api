const fs = require("fs");
const cron = require("node-cron");

const catchAsync = require("./catchAsync");
const mongoose = require("mongoose");
const AppError = require("./appError");

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

const populate = (popOptions) =>
  catchAsync(async (req, res, next) => {
    req.popOptions = popOptions;
    next();
  });

const isAggregate = (that) => that.query instanceof mongoose.Aggregate;

const sendNotification = (doc) => {
  console.log(
    "Task executed at:",
    new Date(),
    doc.title
    // document.recipients
  );
};

const scheduleTask = (document, task) =>
  cron.schedule(document.periodicity, task.bind(null, document));

const restrictPerSubdomain = (user, req) =>
  // TODO: fix these urls
  user.roles.includes("student")
    ? ![
        "ta.students.bashiroglu.dev",
        process.env.NODE_ENV === "development" && "127.0.0.1:3001",
      ].includes(req.get("origin"))
    : user.roles.includes("teacher") &&
      [
        "ta.teachers.bashiroglu.dev",
        process.env.NODE_ENV === "development" && "127.0.0.1:3001",
      ].includes(req.get("origin"));

const archive = catchAsync(async (req, res, next) => {
  const field = req.url.split("/").at(-1);
  if (!["archive", "unarchive"].includes(field) || !value)
    return next(new AppError("dont_use_this_endpoint", 400));

  req.body = { archive: field === "archive" };
  next();
});

const hasCommons = (array1, array2) =>
  array1.filter((el) => array2.includes(el)).length;

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
  hasCommons,
};
