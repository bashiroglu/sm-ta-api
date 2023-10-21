const factory = require("./helpers/handlerFactory");
const LowerCategoryModel = require("../models/lowerCategoryModel");

exports.getLowerCategories = factory.getAll(LowerCategoryModel);
exports.getLowerCategory = factory.getOne(LowerCategoryModel);
exports.createLowerCategory = factory.createOne(LowerCategoryModel);
exports.updateLowerCategory = factory.updateOne(LowerCategoryModel);
exports.archiveLowerCategory = factory.archiveOne(LowerCategoryModel);
exports.deleteLowerCategory = factory.deleteOne(LowerCategoryModel);
