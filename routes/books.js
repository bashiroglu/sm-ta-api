const express = require("express");
const {
  getBooks,
  createBook,
  getBook,
  updateBook,
  archiveBook,
  deleteBook,
} = require("../controllers/bookController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getBooks).post(createBook);
router.route("/:id").get(getBook).patch(updateBook).delete(deleteBook);
router.route("/:id/archive").patch(archiveBook);

module.exports = router;
