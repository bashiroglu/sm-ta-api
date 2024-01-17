const express = require("express");
<<<<<<< Updated upstream
const { getDirFileNames } = require("../utils/helpers");
const { protect, restrictTo } = require("../controllers/authController");
const controllers = require("../controllers");
=======
const { protect } = require("../controllers/authController");
const publicRouter = require("./public");
const protectedRouter = require("./protected");
>>>>>>> Stashed changes

const parentRouter = express.Router();

<<<<<<< Updated upstream
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
=======
router.use("/public", publicRouter);
router.use("/public", protect, protectedRouter);
>>>>>>> Stashed changes

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
