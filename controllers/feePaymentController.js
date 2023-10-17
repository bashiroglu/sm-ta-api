const factory = require("./helpers/handlerFactory");
const FeePaymentModel = require("../models/feePaymentModel");

exports.getFeePayments = factory.getAll(FeePaymentModel);
exports.getFeePayment = factory.getOne(FeePaymentModel);
exports.createFeePayment = factory.createOne(FeePaymentModel);
exports.updateFeePayment = factory.updateOne(FeePaymentModel);
exports.archiveFeePayment = factory.archiveOne(FeePaymentModel);
exports.deleteFeePayment = factory.deleteOne(FeePaymentModel);
