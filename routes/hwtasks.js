const express = require("express");
const {
  getHwtasks,
  createHwtask,
  getHwtask,
  updateHwtask,
  makeDeletedHwtask,
  deleteHwtask,
} = require("../controllers/hwtaskController");
const { protect, restrictTo } = require("../controllers/authController");
const { archive } = require("../utils/helpers");

const router = express.Router();

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager", "teacher")
);

router.route("/").get(getHwtasks).post(createHwtask);
router
  .route("/:id")
  .get(getHwtask)
  .patch(updateHwtask)
  .delete(makeDeletedHwtask);

router.route("/:id/archive").get(archive, updateHwtask);
router.route("/:id/unarchive").get(archive, updateHwtask);
router.route("/:id/delete").delete(deleteHwtask);

module.exports = router;
