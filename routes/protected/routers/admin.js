const express = require("express");
const { modules } = require("../../../utils/constants/modules");
const { archive, sendRes, makeDeleted } = require("../../../utils/helpers");
const getCode = require("../../../utils/getCode");
const handlerFactory = require("../../../utils/handlerFactory");

const router = express.Router();

modules.forEach((module) => {
  const { route, model } = module;
  const router = require(`./${route}`);
  if (model) {
    const Model = require(`../models/${model}Model`);
    const { createOne, getAll, getOne, updateOne, deleteOne } =
      handlerFactory(Model);

    router.route("/").get(getAll).post(getCode(model), createOne);
    router
      .route("/:id")
      .get(getOne, sendRes)
      .patch(updateOne, sendRes)
      .delete(makeDeleted, updateOne, sendRes);

    router.route("/:id/archive").get(archive, updateOne, sendRes);
    router.route("/:id/unarchive").get(archive, updateOne, sendRes);
    router.route("/:id/delete").delete(deleteOne, sendRes);
  }
  adminRouter.use(`/${route}`, router, protect);
});

module.exports = router;
