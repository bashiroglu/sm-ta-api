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

const router = express.Router();

router.use(protect);

router.route("/").get(getHwtasks).post(createHwtask);
router
  .route("/:id")
  .get(getHwtask)
  .patch(updateHwtask)
  .delete(makeDeletedHwtask);
router.route("/:id/delete").delete(deleteHwtask);

module.exports = router;
