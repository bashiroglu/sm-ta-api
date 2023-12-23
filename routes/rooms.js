const express = require("express");
const {
  getRooms,
  createRoom,
  getRoom,
  updateRoom,
  makeDeletedRoom,
  deleteRoom,
} = require("../controllers/roomController");
const { populate, archive } = require("../utils/helpers");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getRooms).post(createRoom);
router
  .route("/:id")
  .get(populate({ path: "branch", select: "name -managers" }), getRoom)
  .patch(updateRoom)
  .delete(makeDeletedRoom);

router.route("/:id/archive").get(archive, updateRoom);
router.route("/:id/unarchive").get(archive, updateRoom);
router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteRoom);

module.exports = router;
