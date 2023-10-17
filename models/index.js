const { getDirFileNames } = require("../utils/helpers");

const modelFileNames = getDirFileNames("./models");
const models = {};
modelFileNames.forEach((name) => {
  if (!name.startsWith("index")) {
    name = name.replace(".js", "");
    models[
      `${name.at(0).toUpperCase() + name.slice(1)}`
    ] = require(`./${name}`);
  }
});

module.exports = models;
