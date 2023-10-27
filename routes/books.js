const express = require("express");
const {
  getBooks,
  createBook,
  getBook,
  updateBook,
  makeDeletedBook,
  deleteBook,
} = require("../controllers/bookController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getBooks).post(createBook);
router.route("/:id").get(getBook).patch(updateBook).delete(makeDeletedBook);
router.route("/:id/delete").delete(deleteBook);

module.exports = router;
