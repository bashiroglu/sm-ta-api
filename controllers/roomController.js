const factory = require("./helpers/handlerFactory");
const RoomModel = require("../models/roomModel");
const catchAsync = require("../utils/catchAsync");

exports.getRooms = factory.getAll(RoomModel);
exports.getRoom = factory.getOne(RoomModel);
exports.createRoom = factory.createOne(RoomModel);
exports.updateRoom = factory.updateOne(RoomModel);
exports.archiveRoom = factory.archiveOne(RoomModel);
exports.deleteRoom = factory.deleteOne(RoomModel);

exports.populate = catchAsync(async (req, res, next) => {
  req.popOptions = { path: "branch", select: "name -managers" };
  next();
});
