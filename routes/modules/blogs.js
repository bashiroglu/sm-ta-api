const express = require("express");
const { incrementViewCount } = require("../controllers/blogController");
const router = express.Router();
router.route("/:id/view").get(incrementViewCount, updateOne);
module.exports = router;
