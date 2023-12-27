const express = require("express");
const {
  getBooks,
  createBook,
  getBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");
const { protect, restrictTo } = require("../controllers/authController");
const { archive, makeDeleted } = require("../utils/helpers");

const router = express.Router();

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager", "teacher")
);

router.route("/").get(getBooks).post(createBook);
router
  .route("/:id")
  .get(getBook)
  .patch(updateBook)
  .delete(makeDeleted, updateBook);

router.route("/:id/archive").get(archive, updateBook);
router.route("/:id/unarchive").get(archive, updateBook);
router.route("/:id/delete").delete(deleteBook);

module.exports = router;
