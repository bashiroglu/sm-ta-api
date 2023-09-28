const express = require("express");
const {
  getRooms,
  createRoom,
  getRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getRooms).post(restrictTo("user"), createRoom);
router
  .route("/:id")
  .get(getRoom)
  .patch(restrictTo("user", "admin"), updateRoom)
  .delete(restrictTo("user", "admin"), deleteRoom);

module.exports = router;
