const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const hpp = require("hpp");
const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");
const sanitizer = require("express-mongo-sanitize");
const xss = require("xss-clean");
const RateLimit = require("express-rate-limit");
const errorHandler = require("./controllers/helpers/errorHandlerController");
const routes = require("./routes");
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    backend: {
      loadPath: "./locales/{{lng}}/translation.json",
    },
  });

const AppError = require("./utils/appError");

const app = express();
app.use(middleware.handle(i18next));
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

app.use("/api/v1", routes);

app.all("*", (req, res, next) => {
  const errorMessage = req.t("route_not_found", {
    url: req.originalUrl,
  });

  next(new AppError(errorMessage, 404));
});

app.use(errorHandler);

module.exports = app;
