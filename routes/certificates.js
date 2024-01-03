const express = require("express");
const {
  getCertificates,
  createCertificate,
  getCertificate,
  updateCertificate,
  deleteCertificate,
} = require("../controllers/certificateController");

const { populate, archive, makeDeleted } = require("../utils/helpers");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getCertificates).post(createCertificate);

router
  .route("/:id")
  .get(
    populate({ path: "createdBy", select: "name surname fullName" }),
    getCertificate,
  )
  .patch(updateCertificate)
  .delete(makeDeleted, deleteCertificate);

router.route("/:id/archive").get(archive, updateCertificate);
router.route("/:id/unarchive").get(archive, updateCertificate);

router
  .route("/:id/delete")
  .delete(restrictTo("roles", "admin"), deleteCertificate);

module.exports = router;
