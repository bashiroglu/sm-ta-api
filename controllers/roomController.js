const factory = require("./helpers/handlerFactory");
const RoomModel = require("../models/roomModel");

exports.getRooms = factory.getAll(RoomModel);
exports.getRoom = factory.getOne(RoomModel);
exports.createRoom = factory.createOne(RoomModel);
exports.updateRoom = factory.updateOne(RoomModel);
exports.deleteRoom = factory.deleteOne(RoomModel);
