const cron = require("node-cron");
const mongoose = require("mongoose");
const moment = require("moment");

const Model = require("./../models/userModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const {
  filterObject,
  startTransSession,
  haveCommon,
} = require("../utils/helpers");
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
    body: { name, surname, patronymic },
    params: { role },
  } = req;

  const rolesArr = new Set([role]);
  if (employeeRoles.values().includes(role)) {
    rolesArr.add(roles.EMPLOYEE);
    const n = name ? name.at(0) : "";
    const s = surname ? surname.at(0) : "";
    const p = patronymic ? patronymic.at(0) : "";
    req.body.initial = `${n}${s}${p}`.toUpperCase();
  }
  req.body.roles = [...rolesArr];

  const id = mongoose.Types.ObjectId();
  req.body._id = id;
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
    path: "enrollments",
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
  const { originalUrl, body, method } = req;
  const field = originalUrl.split("/").at(-1);
  const value = body[field];

  if (!["tags", "permissions"].includes(field) || !value)
    return next(new AppError("dont_use_this_endpoint", 400));

  req.body = method === "PATCH" ? { [field]: value } : undefined;
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

const checkMembership = catchAsync(async (req, res, next) => {
  if (!req.baseUrl.endsWith("users")) next();
  const user = await Model.findById(req.params.id).populate([
    { path: "teacherGroups" },
    { path: "branches" },
    { path: "enrollments", match: { status: "active" } },
  ]);
  const { roles: userRoles, teacherGroups, branches, enrollments } = user;
  if (userRoles.includes(roles.TEACHER) && teacherGroups?.length)
    return next(new AppError("Teacher has group membership", 400));

  if (userRoles.includes(roles.MANAGER) && branches?.length)
    return next(new AppError("User is manager of a branch", 400));

  if (userRoles.includes(roles.STUDENT) && enrollments?.length)
    return next(new AppError("Student has active group enrollment", 400));
  next();
});

const checkMe = (req, res, next) => {
  const isMe = req.originalUrl.endsWith("users/me");
  const {
    body,
    method,
    user: { id, roles },
  } = req;

  if (isMe) {
    const { password, passwordConfirm } = body;
    req.params.id = id;
    if (method === "PATCH") {
      if (password || passwordConfirm)
        return next(new AppError("not_for_password_update", 400));
      req.body = filterObject(
        ...body,
        "name",
        "email",
        "surname",
        "patronymic",
        "phoneNumbers",
        "dateOfBirth",
        "profileImage"
      );
    }
    if (method === "GET")
      req.popOptions = { path: "guardian", select: "name surname code" };
  } else if (haveCommon(["admin", "manager"], roles)) {
    return next(new AppError("not_authorized", 403));
  }

  next();
};

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
  checkMembership,
  checkMe,
};
