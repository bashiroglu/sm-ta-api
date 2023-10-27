const express = require("express");
const {
  getPackages,
  createPackage,
  getPackage,
  updatePackage,
  makeDeletedPackage,
  deletePackage,
} = require("../controllers/packageController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getPackages).post(createPackage);
router
  .route("/:id")
  .get(getPackage)
  .patch(updatePackage)
  .delete(makeDeletedPackage);
router.route("/:id/delete").delete(deletePackage);

module.exports = router;
