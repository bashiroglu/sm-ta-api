const express = require("express");
const {
  getFeePayments,
  createFeePayment,
  getFeePayment,
  updateFeePayment,
  archiveFeePayment,
  deleteFeePayment,
} = require("../controllers/feePaymentController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getFeePayments).post(createFeePayment);
router
  .route("/:id")
  .get(getFeePayment)
  .patch(updateFeePayment)
  .delete(deleteFeePayment);
router.route("/:id/archive").patch(archiveFeePayment);

module.exports = router;
