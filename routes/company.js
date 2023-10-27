const express = require("express");
const {
  createCompany,
  getCompany,
  getCompanies,
  updateCompany,
  makeDeletedCompany,
  deleteCompany,
} = require("../controllers/companyController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(restrictTo("roles", "dev"), getCompanies)
  .post(restrictTo("roles", "owner"), createCompany);

router.use(restrictTo("roles", "owner", "admin"));
router
  .route("/:id")
  .get(getCompany)
  .patch(updateCompany)
  .delete(makeDeletedCompany);
router.route("/:id/delete").delete(deleteCompany);

module.exports = router;
