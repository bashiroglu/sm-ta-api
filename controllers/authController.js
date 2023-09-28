const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");

const signToken = (id) => {
  let JWT_SECRET;
  if (process.env.NODE_ENV.trim() == "development") {
    JWT_SECRET = process.env.JWT_SECRET_DEV;
  } else {
    JWT_SECRET = process.env.JWT_SECRET;
  }
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};

const createTokenAndSignIn = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production")
    cookieOptions.secure =
      req.secure || req.headers["x-forwarded-proto"] === "https";

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const {
    name,
    surname,
    fatherName,
    phoneNumbers,
    email,
    dateOfBirth,
    password,
    passwordConfirm,
  } = req.body;

  const roles = process.env.OWNER_EMAIL === email ? ["owner"] : undefined;
  const active = process.env.OWNER_EMAIL === email || undefined;

  const newUser = await UserModel.create({
    roles,
    surname,
    fatherName,
    name,
    email,
    phoneNumbers,
    dateOfBirth,
    password,
    passwordConfirm,
    active,
  });

  // TODO: Fix below (It will depend on desision):
  if (process.env.NODE_ENV.trim() == "production") {
    const url = `${req.protocol}://${req.get("host")}/me`;
    await new Email(newUser, url).sendWelcome();
  }
  createTokenAndSignIn(newUser, 201, req, res);
});

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
        "Zəhmət olmasa, profilinin aktivləşməsini gözləyin, ehtiyac bilirsinizsə, proqramçı ilə əlaqə saxlayın",
        400
      )
    );
  }

  createTokenAndSignIn(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  let JWT_SECRET;
  if (process.env.NODE_ENV.trim() == "development") {
    JWT_SECRET = process.env.JWT_SECRET_DEV;
  } else {
    JWT_SECRET = process.env.JWT_SECRET;
  }

  const decoded = await promisify(jwt.verify)(token, JWT_SECRET);

  const currentUser = await UserModel.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.getCurrentUser = catchAsync(async (req, res) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    next(new AppError("You can not access with logged in", 401));
  }

  let JWT_SECRET;
  if (process.env.NODE_ENV.trim() === "development") {
    JWT_SECRET = process.env.JWT_SECRET_DEV;
  } else {
    JWT_SECRET = process.env.JWT_SECRET;
  }
  const decoded = await promisify(jwt.verify)(token, JWT_SECRET);

  const user = await UserModel.findById(decoded.id);
  if (!user) {
    return next(new AppError("this user is no longer exist", 401));
  }
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("please log in again", 401));
  }

  res.status(200).json({
    status: "success",
    user,
  });
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    return !roles.filter((v) => req.user.roles.includes(v)).length
      ? next(new AppError("You are not authorized to finish this action", 403))
      : next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with this email", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    user.paswordResetToken = undefined;
    user.paswordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
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
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.paswordResetToken = undefined;
  user.paswordResetTokenExpires = undefined;
  await user.save();
  createTokenAndSignIn(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).select("+password");

  if (!(await user.checkPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("your current password is not right", 500));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  createTokenAndSignIn(user, 200, req, res);
});
