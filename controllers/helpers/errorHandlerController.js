const AppError = require("../../utils/appError");

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDublicatedFieldErrors = (err) => {
  const value = err.message.match(/{.*\./)[0];
  console.log("valuevaluevaluevaluevaluevaluevaluevalue");
  console.log(value);
  console.log("valuevaluevaluevaluevaluevaluevaluevalue");
  const message = `+${value.split(": ")[1].slice(0, -1)} sistemdə var.`;

  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((error) => error.message);
  const message = errors.join(". ");

  return new AppError(message, 400);
};
const handleJsonWebTokenError = (err) =>
  new AppError("invalid credentials, please log in again", 401);
const handleTokenExpiredError = (err) =>
  new AppError("expired token credentials, please log in again", 401);
const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "something went wrong",
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

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  console.log(err);
  if (
    process.env.NODE_ENV.trim() === "production" ||
    process.env.NODE_ENV.trim() === "development"
  ) {
    let error = { ...err };
    error.message = err.message;

    if (err.name === "CastError") error = handleCastError(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError")
      error = handleJsonWebTokenError(error);
    if (err.name === "TokenExpiredError")
      error = handleTokenExpiredError(error);
    if (err.code === 11000) error = handleDublicatedFieldErrors(error);

    sendErrorProd(error, req, res);
  } else {
    sendErrorDev(err, req, res);
  }
};
