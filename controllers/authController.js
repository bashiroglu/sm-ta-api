const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const UserModel = require("../models/userModel");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};

const createTokenAndSignIn = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.cookie();
  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Şifrə və ya email səhvdir", 400));
  }
  const user = await UserModel.findOne({ email }).select("+password");

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError("Şifrə və ya email səhvdir", 401));
  }

  if (!user.active) {
    return next(
      new AppError(
        "Zəhmət olmasa, profilinin aktivləşməsini gözləyin, ehtiyac bilirsinizsə proqramçı ilə əlaqə saxlayın",
        400,
      ),
    );
  }

  createTokenAndSignIn(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    next(new AppError("You can not access with logged in", 401));
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  const user = await UserModel.findById(decoded.id);
  if (!user) {
    return next(new AppError("this user is no longer exist", 401));
  }
  if (user.passwordChanged(decoded.iat)) {
    return next(new AppError("please log in again", 401));
  }

  req.user = user;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) =>
    // checks if there is intersection
    !roles.filter((v) => req.user.roles.includes(v)).length
      ? next(
          new AppError(
            "You are not authorized to finish this action",
            403,
          ),
        )
      : next();

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with this email", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host",
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit ${resetURL}`;

  try {
    res.status(200).json({
      status: "success",
      message: "token was sent",
    });
  } catch (error) {
    user.paswordResetToken = undefined;
    user.paswordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("something happened please try later", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const paswordResetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await UserModel.findOne({
    paswordResetToken,
    paswordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError(
        "some invalid data to reset password, please try again",
        500,
      ),
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.paswordResetToken = undefined;
  user.paswordResetTokenExpires = undefined;
  await user.save();
  createTokenAndSignIn(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).select("+password");

  if (
    !(await user.checkPassword(req.body.currentPassword, user.password))
  ) {
    return next(new AppError("your current password is not right", 500));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  createTokenAndSignIn(user, 200, res);
});

exports.createUser = catchAsync(async (req, res, next) => {
  // const password = crypto.randomBytes(4).toString("hex");
  const {
    name,
    surname,
    email,
    passwordConfirm,
    password,
    dateOfBirth,
    phoneNumbers,
  } = req.body;

  const userObject = {
    name,
    surname,
    email,
    passwordConfirm: passwordConfirm,
    password: password,
    dateOfBirth: dateOfBirth,
    phoneNumbers,
  };

  const newUser = await UserModel.create(userObject);

  res.status(201).json({
    status: "success",
    user: newUser,
  });
});

exports.getUser = catchAsync(async (req, res) => {
  const user = await UserModel.findOne({ _id: req.params.userId });

  res.status(201).json({
    status: "success",
    user: user,
  });
});

exports.getCurrentUser = catchAsync(async (req, res) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    next(new AppError("You can not access with logged in", 401));
  }

  let JWT;
  if (process.env.NODE_ENV.trim() == "development") {
    JWT = process.env.JWT_SECRET_DEV;
  } else {
    JWT = process.env.JWT_SECRET;
  }
  const decoded = await promisify(jwt.verify)(token, JWT);

  const user = await UserModel.findById(decoded.id);
  if (!user) {
    return next(new AppError("this user is no longer exist", 401));
  }
  if (user.passwordChanged(decoded.iat)) {
    return next(new AppError("please log in again", 401));
  }

  res.status(200).json({
    status: "success",
    user,
  });
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};
