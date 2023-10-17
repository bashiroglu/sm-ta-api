const express = require("express");
const { getAll, createOne, getOne, updateOne, archiveOne, deleteOne } =
  require("../controllers").BookController;
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getAll).post(createOne);
router.route("/:id").get(getOne).patch(updateOne).delete(deleteOne);
router.route("/:id/archive").patch(archiveOne);

module.exports = router;
