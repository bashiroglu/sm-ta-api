const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const hpp = require("hpp");
const bodyParser = require("body-parser");
const path = require("path");
const compression = require("compression");
const cors = require("cors");
const sanitizer = require("express-mongo-sanitize");
const xss = require("xss-clean");
const RateLimit = require("express-rate-limit");
const errorHandler = require("./controllers/helpers/errorHandlerController");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const branchRoutes = require("./routes/branchRoutes");
const groupRoutes = require("./routes/groupRoutes");

const cron = require("node-cron");

// Diksiya app Routes

const AppError = require("./utils/appError");

const app = express();

app.use(morgan("dev"));

const limiter = RateLimit({
  max: 1000,
  windowMs: 1000 * 60 * 60,
  message: "Too many requests, please try later",
});

app.use("/api", limiter);

app.use(cors());
app.options("*", cors());

app.use(helmet());
app.use(sanitizer());
app.use(xss());
app.use(hpp());
app.use(compression());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,authorization "
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});
// app.use(express.json());
app.use(bodyParser.json({ limit: "5mb" }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/branches", branchRoutes);
app.use("/api/v1/groups", groupRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`can not find ${req.originalUrl} route`, 404));
});

app.use(errorHandler);

module.exports = app;
