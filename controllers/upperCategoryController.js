const factory = require("./helpers/handlerFactory");
const UpperCategoryModel = require("../models/upperCategoryModel");

exports.getUpperCategories = factory.getAll(UpperCategoryModel);
exports.getUpperCategory = factory.getOne(UpperCategoryModel);
exports.createUpperCategory = factory.createOne(UpperCategoryModel);
exports.updateUpperCategory = factory.updateOne(UpperCategoryModel);
exports.makeDeletedUpperCategory = factory.makeDeletedOne(UpperCategoryModel);
exports.deleteUpperCategory = factory.deleteOne(UpperCategoryModel);
