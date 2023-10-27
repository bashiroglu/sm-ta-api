const express = require("express");
const {
  getRooms,
  createRoom,
  getRoom,
  updateRoom,
  makeDeletedRoom,
  deleteRoom,
  populate,
} = require("../controllers/roomController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getRooms).post(createRoom);
router
  .route("/:id")
  .get(populate, getRoom)
  .patch(updateRoom)
  .delete(makeDeletedRoom);
router.route("/:id/delete").delete(deleteRoom);

module.exports = router;
