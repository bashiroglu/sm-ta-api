const express = require("express");
const {
  createCompany,
  getCompany,
  getCompanies,
  updateCompany,
  makeDeletedCompany,
  deleteCompany,
  checkConstruction,
} = require("../controllers/companyController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.route("/is-under-construction").get(checkConstruction);

router.use(protect);
router.use(restrictTo("roles", "owner"));
router.route("/").get(getCompanies).post(createCompany);

router.use(restrictTo("roles", "owner", "admin"));
router
  .route("/:id")
  .get(getCompany)
  .patch(updateCompany)
  .delete(makeDeletedCompany);
router.route("/:id/delete").delete(deleteCompany);

module.exports = router;
