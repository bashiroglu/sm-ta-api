const UserModel = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
// const filterObject = require("../../utils/filterObject");

// these field names have been applied in
// updateUser and updateMe functions
const allowedFields = [
  "name",
  "surname",
  "fatherName",
  "email",
  "dateOfBirth",
  "tags",
  "permissions",
  "archived",
  "phoneNumbers",
  "socialMediaProfiles",
  "gender",
  "roles",
];

exports.getUser = factory.getOne(UserModel);

exports.getUsers = factory.getAll(UserModel);

// exports.getTinyUsers = catchAsync(async (req, res, next) => {
//   req.query.fields = "name surname roles code note";
//   next();
// });

exports.creatUser = catchAsync(async (req, res, next) => {
  const {
    name,
    surname,
    fatherName,
    email,
    dateOfBirth,
    phoneNumbers, //TODO:

    // socialMediaProfiles,
  } = req.body;

  const password = "123456";

  const userObject = {
    name,
    surname,
    fatherName,
    password,
    passwordConfirm: password,
    email,
    dateOfBirth,
    phoneNumbers: phoneNumbers.length ? phoneNumbers : undefined,
  };

  const newUser = await UserModel.create(userObject);

  res.status(201).json({
    status: "success",
    data: newUser,
  });
});

// exports.updateUser = factory.updateOne(UserModel, { allowedFields });

// exports.makeDeletedUser = factory.makeDeletedOne(UserModel);

// exports.getUserPermissions = catchAsync(async (req, res, next) => {
//   req.query = { fields: "permissions name surname" };
//   next();
// });

// exports.updateUserPermissions = catchAsync(async (req, res, next) => {
//   const { permissions } = req.body;
//   req.body = { permissions };
//   next();
// });

// exports.getUserTags = catchAsync(async (req, res, next) => {
//   req.query = { fields: "tags name surname" };
//   next();
// });

// exports.updateUserTags = catchAsync(async (req, res, next) => {
//   const { tags } = req.body;
//   req.body = { tags };
//   next();
// });

// exports.getMe = (req, res, next) => {
//   req.params.id = req.user.id;
//   next();
// };

// exports.updateMe = catchAsync(async (req, res, next) => {
//   // 1) Create error if user POSTs password data
//   if (req.body.password || req.body.passwordConfirm) {
//     return next(
//       // TODO: change updateMyPassword
//       new AppError(
//         "This route is not for password updates. Please use /updateMyPassword.",
//         400
//       )
//     );
//   }

//   // 2) Filtered out unwanted fields names that are not allowed to be updated
//   const filteredBody = filterObject(req.body, allowedFields);
//   if (req.file) filteredBody.photo = req.file.filename;

//   // 3) Update user document
//   const updatedUser = await UserModel.findByIdAndUpdate(
//     req.user.id,
//     filteredBody,
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   res.status(200).json({
//     status: "success",
//     data: updatedUser,
//   });
// });

// exports.deleteMe = catchAsync(async (req, res, next) => {
//   await UserModel.findByIdAndUpdate(req.user.id, { active: false });

//   res.status(204).json({
//     status: "success",
//     data: null,
//   });
// });
