const express = require("express");
const {
  createCompany,
  getCompany,
  updateCompany,
  deleteCompany,
} = require("../controllers/companyController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").post(restrictTo("owner"), createCompany);
router
  .route("/:id")
  .get(getCompany)
  .patch(restrictTo("user", "admin"), updateCompany)
  .delete(restrictTo("user", "admin"), deleteCompany);

module.exports = router;
