const UserModel = require("../models/userModel");
const factory = require("./helpers/handlerFactory");

exports.getContacts = factory.getAll(UserModel);
