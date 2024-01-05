const express = require("express");
const { getDirFileNames } = require("../utils/helpers");

const router = express.Router();

const routes = getDirFileNames("./routes");

routes.forEach((name) => {
  if (["index.js", "helpers"].includes(name)) return;
  name = name.replace(".js", "");
  router.use(`/${name}`, require(`./${name}`));
});

module.exports = router;
