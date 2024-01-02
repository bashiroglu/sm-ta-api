const express = require("express");
const {
  getBlogs,
  createBlog,
  getBlog,
  updateBlog,
  deleteBlog,
  incrementViewCount,
} = require("../controllers/blogController");
const { protect, restrictTo } = require("../controllers/authController");
const { archive, makeDeleted } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const router = express.Router();
router.route("/").get(getBlogs);
router.route("/:id").get(getBlog);
router.route("/:id/view").get(incrementViewCount, updateBlog);

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));
router.route("/").post(getCode("blog"), createBlog);
router
  .route("/:id")

  .patch(updateBlog)
  .delete(makeDeleted, updateBlog);

router.route("/:id/archive").get(archive, updateBlog);
router.route("/:id/unarchive").get(archive, updateBlog);
router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteBlog);

module.exports = router;
