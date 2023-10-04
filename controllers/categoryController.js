const factory = require("./helpers/handlerFactory");
const CategoryModel = require("../models/categoryModel");

exports.getCategories = factory.getAll(CategoryModel);
exports.getCategory = factory.getOne(CategoryModel);
exports.createCategory = factory.createOne(CategoryModel);
exports.updateCategory = factory.updateOne(CategoryModel);
exports.archiveCategory = factory.archiveOne(CategoryModel);
exports.deleteCategory = factory.deleteOne(CategoryModel);
