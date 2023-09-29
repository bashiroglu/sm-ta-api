const factory = require("./helpers/handlerFactory");
const PackageModel = require("../models/packageModel");

exports.getPackages = factory.getAll(PackageModel);
exports.getPackage = factory.getOne(PackageModel);
exports.createPackage = factory.createOne(PackageModel);
exports.updatePackage = factory.updateOne(PackageModel);
exports.deletePackage = factory.deleteOne(PackageModel);
