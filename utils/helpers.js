const fs = require("fs");
const cron = require("node-cron");

const catchAsync = require("./catchAsync");
const mongoose = require("mongoose");

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

const scheduleTask = (document, task) => {
  const job = cron.schedule(document.periodicity, task.bind(null, document));
  return job;
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
};
