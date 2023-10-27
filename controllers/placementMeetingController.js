const factory = require("./helpers/handlerFactory");
const PlacementMeetingModel = require("../models/placementMeetingModel");

exports.getPlacementMeetings = factory.getAll(PlacementMeetingModel);
exports.getPlacementMeeting = factory.getOne(PlacementMeetingModel);
exports.createPlacementMeeting = factory.createOne(PlacementMeetingModel);
exports.updatePlacementMeeting = factory.updateOne(PlacementMeetingModel);
exports.makeDeletedPlacementMeeting = factory.makeDeletedOne(
  PlacementMeetingModel
);
exports.deletePlacementMeeting = factory.deleteOne(PlacementMeetingModel);
