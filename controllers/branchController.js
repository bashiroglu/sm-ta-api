const factory = require("./helpers/handlerFactory");
const BranchModel = require("../models/branchModel");

exports.getBranches = factory.getAll(BranchModel);
exports.getBranch = factory.getOne(BranchModel);
exports.createBranch = factory.createOne(BranchModel);
exports.updateBranch = factory.updateOne(BranchModel);
exports.deleteBranch = factory.deleteOne(BranchModel);
