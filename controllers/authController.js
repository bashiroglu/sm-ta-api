const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/userModel");
const CompanyModel = require("../models/companyModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const {
  restrictPerSubdomain,
  haveCommon,
  getCode,
  startTransSession,
} = require("../utils/helpers");

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

exports.createTokenAndSignIn = catchAsync(async (req, res, next) => {
  const { user, statusCode } = req;
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

  req.status = statusCode;
  req.obj = { token, user };
  next();
});

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
    },
  } = req;

  const session = await startTransSession(req);

  let roles, code, active;
  if (process.env.ADMIN_EMAIL === email) {
    roles = ["admin"];
    active = true;
    code = "ADMIN_CODE";
  } else {
    code = await getCode(UserModel, session);
  }

  const newUser = await UserModel.create(
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

  // TODO: Fix below (It will depend on desision):
  if (process.env.NODE_ENV.trim() === "production") {
    const url = `${req.protocol}://${req.get("host")}/me`;
    await new Email(newUser, url).sendWelcome();
  }

  req.user = newUser;
  req.statusCode = 201;
  next();
});

exports.login = catchAsync(async (req, res, next) => {
  const {
    body: { email, password },
    query: { chatId },
  } = req;

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

  if (chatId && !user.tgChatId.includes("" + chatId)) {
    user.tgChatId = [...(user.tgChatId && []), chatId];
    await user.save({ validateBeforeSave: false });
  }

  if (restrictPerSubdomain(user, req)) {
    return next(new AppError("not_authorized", 403));
  }

  if (!user.active) {
    return next(new AppError("wait_activation", 400));
  }

  req.user = user;
  req.statusCode = 200;
  next();
});

exports.logout = (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  next();
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

  req.obj = { user };
  next();
});

exports.restrictTo = (items, field = "roles") => {
  return (req, res, next) =>
    // checks if there is intersection
    !haveCommon(items, req.user[field])
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
    console.warn(resetURL);

    req.obj = { message: "Token sent to email!" };
    next();
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

  req.statusCode = 200;
  req.user = user;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).select("+password");

  if (!(await user.checkPassword(req.body.currentPassword, user.password)))
    return next(new AppError("invalid_credentials", 500));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  req.statusCode = 200;
  req.user = user;
  next();
});
