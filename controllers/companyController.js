const factory = require("./helpers/handlerFactory");
const CompanyModel = require("../models/companyModel");

exports.getCompany = factory.getOne(CompanyModel);
exports.createCompany = factory.createOne(CompanyModel);
exports.updateCompany = factory.updateOne(CompanyModel);
exports.archiveCompany = factory.archiveOne(CompanyModel);
exports.deleteCompany = factory.deleteOne(CompanyModel);
