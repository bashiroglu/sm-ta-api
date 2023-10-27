const factory = require("./helpers/handlerFactory");
const CompanyModel = require("../models/companyModel");

exports.getCompany = factory.getOne(CompanyModel);
exports.getCompanies = factory.getAll(CompanyModel);
exports.createCompany = factory.createOne(CompanyModel);
exports.updateCompany = factory.updateOne(CompanyModel);
exports.makeDeletedCompany = factory.makeDeletedOne(CompanyModel);
exports.deleteCompany = factory.deleteOne(CompanyModel);
