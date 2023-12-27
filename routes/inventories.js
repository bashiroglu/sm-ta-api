const express = require("express");
const {
  getInventories,
  createInventory,
  getInventory,
  updateInventory,
  deleteInventory,
} = require("../controllers/inventoryController");
const { protect, restrictTo } = require("../controllers/authController");
const getCode = require("../utils/getCode");
const { archive, makeDeleted } = require("../utils/helpers");

const router = express.Router();

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager", "teacher")
);

router
  .route("/")
  .get(getInventories)
  .post(getCode("inventory"), createInventory);
router
  .route("/:id")
  .get(getInventory)
  .patch(updateInventory)
  .delete(makeDeleted, updateInventory);

router.route("/:id/archive").get(archive, updateInventory);
router.route("/:id/unarchive").get(archive, updateInventory);
router.route("/:id/delete").delete(deleteInventory);

module.exports = router;
