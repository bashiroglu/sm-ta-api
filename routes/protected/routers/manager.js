const express = require("express");
const { modules } = require("../../../utils/constants/modules");
const { archive, sendRes } = require("../../utils/helpers");

const router = express.Router();

modules.forEach((module) => {
  const { route, model } = module;
  const router = require(`./${route}`);
  if (model) {
    const Model = require(`../models/${model}Model`);
    const { updateOne } = require("../helpers/handlerFactory")(Model);
    router.route("/:id/archive").get(archive, updateOne, sendRes);
    router.route("/:id/unarchive").get(archive, updateOne, sendRes);
  }
  adminRouter.use(`/${route}`, router, protect);
});

module.exports = router;
