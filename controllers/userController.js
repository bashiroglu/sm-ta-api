const cron = require("node-cron");

const UserModel = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./helpers/handlerFactory");
const { filterObj } = require("../utils/filterObject");
const { employeeRoles, roles } = require("../utils/constants/enums");

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

exports.getMe = (req, res, next) => {
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
  const filteredBody = filterObj(
    req.body,
    "name",
    "surname",
    "fatherName",
    "phoneNumbers",
    "email",
    "dateOfBirth",
    "profileImage"
  );
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await UserModel.findByIdAndUpdate(req.user.id, { archived: true });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createUserByRole = catchAsync(async (req, res, next) => {
  const role = req.params.role;
  const rolesArr = [role];
  if (employeeRoles.values().includes(role)) rolesArr.push(roles.EMPLOYEE);
  req.body.roles = rolesArr;
  next();
});

exports.getAllByRole = (req, res, next) => {
  req.query.roles = req.params.role;
  next();
};

exports.createUser = factory.createOne(UserModel, { password: true });
exports.getUser = factory.getOne(UserModel);
exports.getUsers = factory.getAll(UserModel);

// Should NOT update passwords with this!
exports.updateUser = factory.updateOne(UserModel);
exports.deleteUser = factory.deleteOne(UserModel);
exports.archiveUser = factory.archiveOne(UserModel);
exports.activateUser = catchAsync(async (req, res, next) => {
  req.body = { active: true };
  next();
});
