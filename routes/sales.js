const express = require("express");
const {
  getSales,
  createSale,
  getSale,
  updateSale,
  deleteSale,
} = require("../controllers/saleController");
const { protect, restrictTo } = require("../controllers/authController");
const { archive, makeDeleted } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const router = express.Router();

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager", "teacher")
);

router.route("/").get(getSales).post(getCode("sale"), createSale);
router
  .route("/:id")
  .get(getSale)
  .patch(updateSale)
  .delete(makeDeleted, updateSale);

router.route("/:id/archive").get(archive, updateSale);
router.route("/:id/unarchive").get(archive, updateSale);
router.route("/:id/delete").delete(deleteSale);

module.exports = router;
