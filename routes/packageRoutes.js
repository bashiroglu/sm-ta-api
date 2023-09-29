const express = require("express");
const {
  getPackages,
  createPackage,
  getPackage,
  updatePackage,
  deletePackage,
} = require("../controllers/packageController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getPackages).post(restrictTo("user"), createPackage);
router
  .route("/:id")
  .get(getPackage)
  .patch(restrictTo("user", "admin"), updatePackage)
  .delete(restrictTo("user", "admin"), deletePackage);

module.exports = router;
