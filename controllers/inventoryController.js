const factory = require("./helpers/handlerFactory");
const InventoryModel = require("../models/inventoryModel");

exports.getInventories = factory.getAll(InventoryModel);
exports.getInventory = factory.getOne(InventoryModel);
exports.createInventory = factory.createOne(InventoryModel);
exports.updateInventory = factory.updateOne(InventoryModel);
exports.archiveInventory = factory.archiveOne(InventoryModel);
exports.deleteInventory = factory.deleteOne(InventoryModel);
