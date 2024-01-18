const cron = require("node-cron");
const mongoose = require("mongoose");
const moment = require("moment");

const Model = require("./../models/userModel");
const GroupModel = require("../models/groupModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const { filterObject } = require("../utils/helpers");
const { employeeRoles, roles } = require("../utils/constants/enums");
const { sendSmsRequest } = require("../utils/sms");

const scheduleBirthdayNotifications = () => {
  cron.schedule(
    "0 9 * * *",
    async () => {
      const tomorrow = moment().add(1, "day").startOf("day");
      const usersWithTomorrowBirthday = await Model.find({
        dateOfBirth: {
          $gte: tomorrow.toDate(),
          $lt: moment(tomorrow).add(1, "day").toDate(),
        },
      });

      usersWithTomorrowBirthday.forEach((user) => {
        console.warn(`Sending notification to user: ${user.name}`);
      });
    },
    { timezone: "Asia/Baku" }
  );
};

const assignParamsId = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  req.body = filterObject(
    req.body,
    "name",
    "email",
    "surname",
    "patronymic",
    "phoneNumbers",
    "dateOfBirth",
    "profileImage"
  );

  next();
});

const createUserByRole = catchAsync(async (req, res, next) => {
  const {
    session,
    body: { group },
    params: { role },
  } = req;

  const rolesArr = new Set([role]);
  if (employeeRoles.values().includes(role)) rolesArr.add(roles.EMPLOYEE);
  req.body.roles = [...rolesArr];

  const id = mongoose.Types.ObjectId();
  req.body._id = id;
  if (group) {
    const groupDoc = await GroupModel.findByIdAndUpdate(
      group,
      { $addToSet: { students: { student: id } } },
      { new: true, session }
    );
    if (!groupDoc) return next(new AppError("group_not_found", 404));
  }
  next();
});

const getAllByRole = (req, res, next) => {
  req.query.roles = req.params.role;
  next();
};

const aliasTinyStudent = catchAsync(async (req, res, next) => {
  req.query.fields = "name surname patronymic code";
  req.query.roles = "student";
  req.popOptions = {
    path: "groups",
    match: { status: "active" },
    select: "group",
    populate: {
      path: "group",
      select: "program",
      populate: "program",
    },
  };
  next();
});

const setPassword = catchAsync(async (req, res, next) => {
  req.body.password = req.body.passwordConfirm =
    process.env.DEFAULT_USER_PASSWORD;
  next();
});

const excludeFields = catchAsync(async (req, res, next) => {
  req.query.fields = "-query -note";
  next();
});

const setReqBody = catchAsync(async (req, res, next) => {
  const {
    body: { url },
    body,
    method,
  } = req;
  const field = url.split("/").at(-1);
  const value = body[field];

  if (!["tags", "permissions"].includes(field) || !value)
    return next(new AppError("dont_use_this_endpoint", 400));

  req.body = method === "PATCH" ? { [field]: body[field] } : undefined;
  req.query.fields = field;
  next();
});

const activateUser = catchAsync(async (req, res, next) => {
  req.body = { active: true };
  next();
});

const deactivateUser = catchAsync(async (req, res, next) => {
  req.body = { active: false };
  next();
});

module.exports = {
  scheduleBirthdayNotifications,
  assignParamsId,
  updateMe,
  createUserByRole,
  getAllByRole,
  setPassword,
  excludeFields,
  setReqBody,
  activateUser,
  deactivateUser,
  aliasTinyStudent,
};
