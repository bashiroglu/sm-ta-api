const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/userModel");
const CompanyModel = require("../models/companyModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const { restrictPerSubdomain } = require("../utils/helpers");

const signToken = (id) => {
  let JWT_SECRET;
  if (process.env.NODE_ENV.trim() === "development") {
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
  if (process.env.NODE_ENV.trim() === "production")
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
    body: {
      name,
      surname,
      patronymic,
      phoneNumbers,
      email,
      dateOfBirth,
      password,
      passwordConfirm,
      code,
    },
    session,
  } = req;

  const roles = process.env.OWNER_EMAIL === email ? ["owner"] : undefined;
  const active = process.env.OWNER_EMAIL === email || undefined;
  let newUser;

  newUser = await UserModel.create(
    [
      {
        roles,
        surname,
        patronymic,
        name,
        email,
        phoneNumbers,
        dateOfBirth,
        password,
        passwordConfirm,
        active,
        code,
      },
    ],
    { session }
  );
  await session.commitTransaction();
  session.endSession();

  // TODO: Fix below (It will depend on desision):
  if (process.env.NODE_ENV.trim() === "production") {
    const url = `${req.protocol}://${req.get("host")}/me`;
    await new Email(newUser, url).sendWelcome();
  }
  createTokenAndSignIn(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("invalid_credentials", 400));
  }
  const user = await UserModel.findOne({ email })
    .select("-query -note")
    .populate({
      path: "branches",
      select: "-managers name code",
    })
    .select("+password");

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError("invalid_credentials", 401));
  }

  if (restrictPerSubdomain(user, req)) {
    return next(new AppError("not_authorized", 403));
  }

  if (!user.active) {
    return next(new AppError("wait_activation", 400));
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
    req.headers.authorization?.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError("not_logged_in", 401));

  let JWT_SECRET;
  if (process.env.NODE_ENV.trim() === "development") {
    JWT_SECRET = process.env.JWT_SECRET_DEV;
  } else {
    JWT_SECRET = process.env.JWT_SECRET;
  }

  const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
  const currentUser = await UserModel.findById(decoded.id).populate([
    {
      path: "branches",
      select: "-managers code name",
    },
    {
      path: "permissions",
      select: "slug",
    },
  ]);

  if (!currentUser) return next(new AppError("token_user_not_exist", 401));

  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(new AppError("password_changed_recent", 401));

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.getCurrentUser = catchAsync(async (req, res, next) => {
  const company = await CompanyModel.findById(process.env.COMPANY_ID);
  if (!company || company.isUnderConstruction)
    return next(new AppError("under_construction", 400));

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError("not_logged_in", 401));

  let JWT_SECRET;
  if (process.env.NODE_ENV.trim() === "development") {
    JWT_SECRET = process.env.JWT_SECRET_DEV;
  } else {
    JWT_SECRET = process.env.JWT_SECRET;
  }
  const decoded = await promisify(jwt.verify)(token, JWT_SECRET);

  const user = await UserModel.findById(decoded.id).populate({
    path: "branches",
    select: "-managers name code",
  });
  if (!user) return next(new AppError("token_user_not_exist", 401));

  if (user.changedPasswordAfter(decoded.iat))
    return next(new AppError("password_changed_recent", 401));

  res.status(200).json({
    status: "success",
    user,
  });
});

/**
 * Use for permissions or roles restrictions
 * @param {string} field
 * @param  {...string} items
 * @returns next()
 */
exports.restrictTo = (field, ...items) => {
  return (req, res, next) =>
    // checks if there is intersection
    !items.filter((v) => req.user[field].includes(v)).length
      ? next(new AppError("not_authorized", 403))
      : next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) return next(new AppError("token_user_not_exist", 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    if (process.env.NODE_ENV.trim() === "production")
      await new Email(user, resetURL).sendPasswordReset();
    else console.log(resetURL);

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    user.paswordResetToken = undefined;
    user.paswordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("email_sending_error", 500));
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

  if (!user) return next(new AppError("invalid_token", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.paswordResetToken = undefined;
  user.paswordResetTokenExpires = undefined;
  await user.save();
  createTokenAndSignIn(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).select("+password");

  if (!(await user.checkPassword(req.body.currentPassword, user.password)))
    return next(new AppError("invalid_credentials", 500));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  createTokenAndSignIn(user, 200, req, res);
});
