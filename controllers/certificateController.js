const factory = require("./helpers/handlerFactory");
const CertificateModel = require("../models/certificateModel");

exports.getCertificates = factory.getAll(CertificateModel);
exports.getCertificate = factory.getOne(CertificateModel);
exports.createCertificate = factory.createOne(CertificateModel);
exports.updateCertificate = factory.updateOne(CertificateModel);
exports.deleteCertificate = factory.deleteOne(CertificateModel);
