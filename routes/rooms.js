const express = require("express");
const {
  getRooms,
  createRoom,
  getRoom,
  updateRoom,
  archiveRoom,
  deleteRoom,
} = require("../controllers/roomController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getRooms).post(createRoom);
router.route("/:id").get(getRoom).patch(updateRoom).delete(deleteRoom);
router.route("/:id/archive").patch(archiveRoom);

module.exports = router;
