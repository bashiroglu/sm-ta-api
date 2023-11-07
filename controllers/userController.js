const UserModel = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./helpers/handlerFactory");
const { filterObject } = require("../utils/helpers");

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
    "email",
    "dateOfBirth",
    "profileImage"
  );
  if (req.file) filteredBody.photo = req.file.filename;

  next();
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await UserModel.findByIdAndUpdate(req.user.id, { archived: true });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createUserByRole = catchAsync(async (req, res, next) => {
  req.body.roles = [req.params.role];
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

exports.populateParticipations = catchAsync(async (req, res, next) => {
  req.popOptions = [
    { path: "absents", select: "group" },
    {
      path: "presents",
      select: "_id group",
      populate: {
        path: "group",
        select: "name",
      },
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
