const express = require("express");
const { getDirFileNames } = require("../utils/helpers");

const router = express.Router();

const routes = getDirFileNames("./routes");

routes.forEach((name) => {
  if (name !== "index.js") {
    name = name.replace(".js", "");
    router.use(`/${name}`, require(`./${name}`));
  }
});

module.exports = router;
