const factory = require("./helpers/handlerFactory");
const PlacementMeetingResultModel = require("../models/placementMeetingResultModel");

exports.getPlacementMeetingResults = factory.getAll(
  PlacementMeetingResultModel
);
exports.getPlacementMeetingResult = factory.getOne(PlacementMeetingResultModel);
exports.createPlacementMeetingResult = factory.createOne(
  PlacementMeetingResultModel
);
exports.updatePlacementMeetingResult = factory.updateOne(
  PlacementMeetingResultModel
);
exports.archivePlacementMeetingResult = factory.archiveOne(
  PlacementMeetingResultModel
);
exports.deletePlacementMeetingResult = factory.deleteOne(
  PlacementMeetingResultModel
);
