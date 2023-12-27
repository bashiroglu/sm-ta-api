const factory = require("./helpers/handlerFactory");
const BookModel = require("../models/bookModel");

exports.getBooks = factory.getAll(BookModel);
exports.getBook = factory.getOne(BookModel);
exports.createBook = factory.createOne(BookModel);
exports.updateBook = factory.updateOne(BookModel);
exports.deleteBook = factory.deleteOne(BookModel);
