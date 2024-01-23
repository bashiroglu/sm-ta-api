const express = require("express");
const { archive, sendRes } = require("../utils/helpers");
const { modules } = require("../utils/constants/modules");
const handlerFactory = require("../utils/handlerFactory");
const { restrictTo } = require("../controllers/authController");
const { checkMembership } = require("../controllers/userController");

const mainRouter = express.Router();

modules.forEach((module) => {
  const router = require(`./routers/${module.route}`);

  if (module.model) {
    const Model = require(`../models/${module.model}Model`);
    const { updateOne, deleteOne } = handlerFactory(Model);

    router.route("/:id/archive").patch(archive, updateOne);
    router.route("/:id/unarchive").patch(archive, updateOne);

    if (!["upperCategory", "lowerCategory", "log"].includes(module.model))
      router
        .route("/:id/delete")
        .delete(restrictTo(["admin"]), checkMembership, deleteOne);
  }
  router.use(sendRes);

  mainRouter.use(`/${module.route}`, router);
});

module.exports = mainRouter;
