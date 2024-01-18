const dotenv = require("dotenv");
const mongoose = require("mongoose");

const app = require("./app");
// const bot = require("./bot");

dotenv.config({ path: "./config.env" });

let DB;
if (process.env.NODE_ENV.trim() === "development") {
  DB = process.env.DB_CONNECTION_DEV.replace(
    "<password>",
    process.env.DB_PASSWORD_DEV
  );
} else if (process.env.NODE_ENV.trim() === "production") {
  DB = process.env.DB_CONNECTION.replace("<password>", process.env.DB_PASSWORD);
}

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.warn("connected to DB");
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.warn("sm-api-ta runs");
});

// bot.start();
// console.warn("Bot is ready to accept requests...");

process.on("unhandledRejection", (err) => {
  console.error("uncaughtException", "\n", err);

  server.close(() => {
    process.exit();
  });
});

process.on("warning", (e) => console.warn(e.stack));
