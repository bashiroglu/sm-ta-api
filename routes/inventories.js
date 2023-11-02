const express = require("express");
const {
  getInventories,
  createInventory,
  getInventory,
  updateInventory,
  makeDeletedInventory,
  deleteInventory,
} = require("../controllers/inventoryController");
const { protect, restrictTo } = require("../controllers/authController");
const getCode = require("../utils/getCode");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getInventories)
  .post(getCode("inventory"), createInventory);
router
  .route("/:id")
  .get(getInventory)
  .patch(updateInventory)
  .delete(deleteInventory);
router.route("/:id/delete").delete(deleteInventory);

module.exports = router;
