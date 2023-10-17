const express = require("express");
const {
  createCompany,
  getCompany,
  updateCompany,
  archiveCompany,
  deleteCompany,
} = require("../controllers/companyController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.use(restrictTo("owner"));
router.route("/").get(getCompanies).post(createCompany);

router.use(restrictTo("owner", "admin"));
router.route("/:id").get(getCompany).patch(updateCompany).delete(deleteCompany);
router.route("/:id/archive").patch(archiveCompany);

module.exports = router;
