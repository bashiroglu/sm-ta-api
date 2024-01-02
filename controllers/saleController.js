const factory = require("./helpers/handlerFactory");
const SaleModel = require("../models/saleModel");
const catchAsync = require("../utils/catchAsync");

exports.getSales = factory.getAll(SaleModel);
exports.getSale = factory.getOne(SaleModel);
exports.createSale = factory.createOne(SaleModel);
exports.updateSale = factory.updateOne(SaleModel);
exports.deleteSale = factory.deleteOne(SaleModel);
