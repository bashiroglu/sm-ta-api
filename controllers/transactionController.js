const factory = require("./helpers/handlerFactory");
const TransactionModel = require("../models/transactionModel");

exports.getTransactions = factory.getAll(TransactionModel);
exports.getTransaction = factory.getOne(TransactionModel);
exports.createTransaction = factory.createOne(TransactionModel);
exports.updateTransaction = factory.updateOne(TransactionModel);
exports.deleteTransaction = factory.deleteOne(TransactionModel);
