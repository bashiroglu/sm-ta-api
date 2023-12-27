const express = require("express");
const {
  getPrograms,
  createProgram,
  getProgram,
  updateProgram,
  makeDeletedProgram,
  deleteProgram,
} = require("../controllers/programController");
const { protect, restrictTo } = require("../controllers/authController");
const { archive } = require("../utils/helpers");

const router = express.Router();

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager", "teacher")
);

router.route("/").get(getPrograms).post(createProgram);
router
  .route("/:id")
  .get(getProgram)
  .patch(updateProgram)
  .delete(makeDeletedProgram);

router.route("/:id/archive").get(archive, updateProgram);
router.route("/:id/unarchive").get(archive, updateProgram);
router.route("/:id/delete").delete(deleteProgram);

module.exports = router;
