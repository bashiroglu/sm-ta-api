const cron = require("node-cron");
const mongoose = require("mongoose");

const UserModel = require("./../models/userModel");
const GroupModel = require("../models/groupModel");
const AppError = require("./../utils/appError");
const factory = require("./helpers/handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const { filterObject } = require("../utils/helpers");
const { employeeRoles, roles } = require("../utils/constants/enums");
const { sendSmsRequest } = require("../utils/sms");

exports.schedulePaymentNotifications = () => {
  // TODO: schedule a task to run at 17:58 on the 3rd of every month change if needed
  cron.schedule("58 17 3 * *", async () => {
    const guardians = await UserModel.aggregate([
      [
        {
          $match: {
            roles: "student",
            deleted: { $ne: true },
            nextPaymentDate: { $lt: new Date() },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "guardian",
            foreignField: "_id",
            as: "guardian",
          },
        },
        {
          $unwind: "$guardian",
        },
        {
          $project: {
            studentName: "$name",
            studentSurname: "$surname",
            guardianName: "$guardian.name",
            guardianSurname: "$guardian.surname",
            phoneNumber: { $arrayElemAt: ["$guardian.phoneNumbers", 0] },
            email: "$guardian.email",
          },
        },
      ],
    ]);

    guardians.forEach(
      async ({
        studentName,
        studentSurname,
        guardianName,
        guardianSurname,
        phoneNumber,
        email,
      }) => {
        const smsText = `Dear, ${guardianName} ${guardianSurname}. Please pay the monthly fee for your child ${studentName} ${studentSurname}`;
        if (process.env.NODE_ENV.trim() === "development") {
          console.log(smsText);
        } else {
          // const result = await sendSmsRequest(phoneNumber, smsText);
          // TODO: Send Email and SMS
        }
      }
    );
  });
};

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
    "patronymic",
    "phoneNumbers",
    "dateOfBirth",
    "profileImage"
  );
  if (req.file) filteredBody.photo = req.file.filename;

  next();
});

exports.createUserByRole = catchAsync(async (req, res, next) => {
  const {
    session,
    body: { group },
    params: { role },
  } = req;

  const rolesArr = [role];
  if (employeeRoles.values().includes(role)) rolesArr.push(roles.EMPLOYEE);
  req.body.roles = rolesArr;

  const id = mongoose.Types.ObjectId();
  req.body._id = id;
  if (group) {
    const groupDoc = await GroupModel.findByIdAndUpdate(
      group,
      {
        $push: { students: id },
      },
      { new: true, session }
    );

    if (!groupDoc) {
      await session.abortTransaction();
      return next(new AppError("group_not_found", 404));
    }
  }
  next();
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

exports.assignPassword = catchAsync(async (req, res, next) => {
  req.body.password = req.body.passwordConfirm =
    process.env.DEFAULT_USER_PASSWORD;
  next();
});

exports.assignCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;

  // Checks if user try to update not indented field
  // TODO: Make this more automotically
  if (!["tags", "permissions"].includes(category))
    return next(new AppError("dont_use_this_endpoint"));

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
