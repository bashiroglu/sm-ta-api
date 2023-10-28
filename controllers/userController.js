const cron = require("node-cron");
const mongoose = require("mongoose");

const UserModel = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./helpers/handlerFactory");
const { filterObject } = require("../utils/helpers");
const { employeeRoles, roles } = require("../utils/constants/enums");
const GroupModel = require("../models/groupModel");

cron.schedule("0 0 3 * *", async () => {
  const today = new Date();
  const overdueStudents = await UserModel.find({
    roles: roles.STUDENT,
    nextPaymentDate: { $lt: today },
  })
    .populate({ path: "guardian", select: "name phoneNumbers email" })
    .populate({ path: "packages", select: "price" });

  const guardians = overdueStudents.reduce((acc, curr) => {
    if (!acc[curr.guardian.id])
      acc[curr.guardian.id] = {
        phoneNumbers: curr.guardian.phoneNumbers,
        name: curr.guardian.name,
        email: curr.guardian.email,
        students: [],
        total: 0,
      };
    acc[curr.guardian.id].students.push(curr.name);
    acc[curr.guardian.id].total += curr.packages.reduce((a, c) => {
      a += c.price;
      return a;
    }, 0);
    return acc;
  }, {});

  guardians.forEach((guardian) => {
    const smsText = `Dear, ${guardian.name}. Please pay the amount ${guardian.total}`;
    if (process.env.NODE_ENV.trim() == "development") {
      console.log(smsText);
    } else {
      // TODO: Send Email and SMS
    }
  });
});

exports.assignParamsId = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
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
    "surname",
    "fatherName",
    "phoneNumbers",
    "dateOfBirth",
    "profileImage"
  );
  if (req.file) filteredBody.photo = req.file.filename;

  next();
});

exports.createUserByRole = catchAsync(async (req, res, next) => {
  const role = req.params.role;
  const rolesArr = [role];
  if (employeeRoles.values().includes(role)) rolesArr.push(roles.EMPLOYEE);
  req.body.roles = rolesArr;

  if (req.body.group) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { group } = req.body;

      const user = await UserModel.create({
        ...req.body,
        passwordConfirm: process.env.DEFAULT_USER_PASSWORD,
        password: process.env.DEFAULT_USER_PASSWORD,
        createdBy: req.user.id,
      });

      await GroupModel.findByIdAndUpdate(group, {
        $push: { students: user.id },
      });

      req.doc = user;
      await session.commitTransaction();
      session.endSession();
      next();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(new AppError(error.message));
    }
  } else next();
});

exports.getAllByRole = (req, res, next) => {
  req.query.roles = req.params.role;
  next();
};

exports.createUser = factory.createOne(UserModel);
exports.getUser = factory.getOne(UserModel);
exports.getUsers = factory.getAll(UserModel);

// Should NOT update passwords with this!
exports.updateUser = factory.updateOne(UserModel);
exports.deleteUser = factory.deleteOne(UserModel);
exports.makeDeletedUser = factory.makeDeletedOne(UserModel);
exports.activateUser = catchAsync(async (req, res, next) => {
  req.body = { active: true };
  next();
});

exports.populateParticipations = catchAsync(async (req, res, next) => {
  req.popOptions = [
    {
      path: "packages",
    },
    {
      path: "absents",
      select: "group",
    },
    {
      path: "presents",
      select: "_id group",
    },
  ];
  next();
});

exports.assignPassword = catchAsync(async (req, res, next) => {
  req.body.password = req.body.passwordConfirm =
    process.env.DEFAULT_USER_PASSWORD;
  next();
});

exports.assignCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;

  // Checks if user try to update not indented field
  // TODO: Apply more automotical method
  if (!["tags", "permissions"].includes(category))
    return next(
      new AppError("This field cannot be updated with this endpoint")
    );

  // Excludes not indented items in req.body
  const obj = {};
  obj[category] = req.body[category];
  req.body = obj;

  // Excludes fields other than category
  req.query.fields = category;
  next();
});

exports.excludeFields = catchAsync(async (req, res, next) => {
  req.query.fields = "-query -note";
  next();
});
