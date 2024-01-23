const Model = require("../models/programModel");
const catchAsync = require("../utils/catchAsync");

const getProgreamNames = catchAsync(async (req, res, next) => {
  const programs = await Model.find().select("detailCode name");

  req.resObj.teachers = req.resObj.data;
  delete req.resObj.data;
  req.resObj.programs = programs;
  next();
});

module.exports = { getProgreamNames };
