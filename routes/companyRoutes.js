const express = require("express");
const {
  createCompany,
  getCompany,
  getCompanies,
  updateCompany,
  archiveCompany,
  deleteCompany,
} = require("../controllers/companyController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getCompanies).post(restrictTo("owner"), createCompany);

router.use(restrictTo("owner", "admin"));
router.route("/:id").get(getCompany).patch(updateCompany).delete(deleteCompany);
router.route("/:id/archive").patch(archiveCompany);

module.exports = router;
