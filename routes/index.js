const express = require("express");
const { archive, sendRes } = require("../utils/helpers");
const { modules } = require("../utils/constants/modules");
const handlerFactory = require("../utils/handlerFactory");
const { restrictTo } = require("../controllers/authController");
const { checkMembership } = require("../controllers/userController");
const { checkManagerExists } = require("../controllers/branchController");
const AppError = require("../utils/appError");

const mainRouter = express.Router();

modules.forEach((module) => {
  if (!module.route) return;
  const router = require(`./routers/${module.route}`);

  if (module.model) {
    const Model = require(`../models/${module.model}Model`);
    const { updateOne, deleteOne } = handlerFactory(Model);

    router.route("/:id/archive").patch(archive, updateOne);
    router.route("/:id/unarchive").patch(archive, updateOne);

    if (!["upperCategory", "lowerCategory", "log"].includes(module.model))
      router
        .route("/:id/delete")
        .delete(
          restrictTo(["admin"]),
          checkManagerExists,
          checkMembership,
          deleteOne
        );
  }
  router.use(
    (req, res, next) =>
      next(
        !req.resObj
          ? new AppError("route_not_found", 404, {
              url: req.originalUrl,
            })
          : ""
      ),
    sendRes
  );

  mainRouter.use(`/${module.route}`, router);
});

module.exports = mainRouter;
