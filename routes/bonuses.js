const express = require("express");
const {
  getBonuses,
  createBonus,
  getBonus,
  updateBonus,
  deleteBonus,
} = require("../controllers/bonusController");
const { protect, restrictTo } = require("../controllers/authController");
const { archive, makeDeleted } = require("../utils/helpers");

const router = express.Router();

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager", "teacher")
);

router.route("/").get(getBonuses).post(createBonus);
router
  .route("/:id")
  .get(getBonus)
  .patch(updateBonus)
  .delete(makeDeleted, updateBonus);

router.route("/:id/archive").get(archive, updateBonus);
router.route("/:id/unarchive").get(archive, updateBonus);
router.route("/:id/delete").delete(deleteBonus);

module.exports = router;
