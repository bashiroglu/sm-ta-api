const express = require("express");
const {
  getInventories,
  createInventory,
  getInventory,
  updateInventory,
  archiveInventory,
  deleteInventory,
} = require("../controllers/inventoryController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getInventories).post(createInventory);
router
  .route("/:id")
  .get(getInventory)
  .patch(updateInventory)
  .delete(deleteInventory);
router.route("/:id/archive").patch(archiveInventory);

module.exports = router;
