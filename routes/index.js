const express = require("express");
const { getDirFileNames } = require("../utils/helpers");
const { protect, restrictTo } = require("../controllers/authController");
const controllers = require("../controllers");

const parentRouter = express.Router();

const routes = getDirFileNames("./routes");
let titleCaseName;
routes.forEach((name) => {
  if (name !== "index.js") {
    name = name.replace(".js", "");
    titleCaseName = `${name.at(0).toUpperCase() + name.slice(1)}`;
    console.log(titleCaseName);
    const controller = controllers[`BookController`];
    console.log(controller);
    // const router = getRouter(controller)

    parentRouter.use(`/${name}`, require(`./${name}`));
  }
});

module.exports = parentRouter;

function getRouter(controller) {
  const { getAll, createOne, getOne, updateOne, archiveOne, deleteOne } =
    controller;

  const router = express.Router();
  router.use(protect);
  router.route("/").get(getAll).post(createOne);
  router.route("/:id").get(getOne).patch(updateOne).delete(deleteOne);
  router.route("/:id/archive").patch(archiveOne);

  return router;
}
