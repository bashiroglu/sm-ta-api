const factory = require("./helpers/handlerFactory");
const AvailabilityModel = require("../models/availabilityModel");
const catchAsync = require("../utils/catchAsync");

exports.getAvailabilities = factory.getAll(AvailabilityModel);
exports.getAvailability = factory.getOne(AvailabilityModel);
exports.createAvailability = factory.createOne(AvailabilityModel);
exports.updateAvailability = factory.updateOne(AvailabilityModel);
exports.makeDeletedAvailability = factory.makeDeletedOne(AvailabilityModel);
exports.deleteAvailability = factory.deleteOne(AvailabilityModel);

exports.assignUser = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
});
