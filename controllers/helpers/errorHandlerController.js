const AppError = require("../../utils/appError");

const handleCastError = (err, req) => {
  const { path, value } = err;
  const errorMessage = req.t("invalid_path_value", { path, value });
  return new AppError(errorMessage, 400);
};
const handleDublicatedFieldErrors = (err, req) => {
  const value = err.message
    .match(/dup key:.*:/)[0]
    .split("{")
    .at(1)
    .split(":")
    .at(0)
    .trim();

  const errorMessage = req.t("value_exists", { value });
  return new AppError(errorMessage, 400);
};
const handleValidationErrorDB = (err, req) => {
  const errorMessages = Object.values(err.errors)
    .map((e) => req.t(e.message, e))
    .join(". ");
  return new AppError(errorMessages, 400);
};
const handleJsonWebTokenError = (err) =>
  new AppError("invalid_credentials", 401);
const handleTokenExpiredError = (err) => new AppError("expired_token", 401);

const sendErrorProd = (err, req, res) => {
  err.message = err.message.replaceAll("&#x2F;", "/");
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: req.t(err.message),
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "something_went_wrong",
    });
  }
};

const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

module.exports = async (err, req, res, next) => {
  const { session } = req;
  if (session) {
    await session.abortTransaction();
    session.endSession();
  }
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (
    // TODO: REMOVE development
    process.env.NODE_ENV.trim() === "production" ||
    process.env.NODE_ENV.trim() === "development"
  ) {
    let error = { ...err };
    error.message = err.message;

    if (err.name === "CastError") error = handleCastError(error, req);
    if (err.name === "ValidationError")
      error = handleValidationErrorDB(error, req);
    if (err.name === "JsonWebTokenError")
      error = handleJsonWebTokenError(error);
    if (err.name === "TokenExpiredError")
      error = handleTokenExpiredError(error);
    if (err.code === 11000) error = handleDublicatedFieldErrors(error, req);

    sendErrorProd(error, req, res);
  } else {
    sendErrorDev(err, req, res);
  }
};
