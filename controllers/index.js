const factory = require("./helpers/handlerFactory");
const models = require("../models");
const { getDirFileNames } = require("../utils/helpers");

const controllerFileNames = getDirFileNames("./controllers");
const controllers = {};
controllerFileNames.forEach((name) => {
  if (!["helpers", "index.js"].includes(name)) {
    name = name.replace(".js", "");
    name = `${name.at(0).toUpperCase() + name.slice(1)}`;
    const model = models[`${name}Model`];
    controllers[name] = {
      ...require(`./${name}`),
      getAll: factory.getAll(model),
      getOne: factory.getOne(model),
      createOne: factory.createOne(model),
      updateOne: factory.updateOne(model),
      archiveOne: factory.archiveOne(model),
      deleteOne: factory.deleteOne(model),
    };
  }
});

module.exports = controllers;
