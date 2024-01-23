const Model = require("../models/programModel");
const catchAsync = require("../utils/catchAsync");

const getProgreamNames = catchAsync(async (req, res, next) => {
  const programs = await Model.find().select("detailCode name");

  req.obj.teachers = req.obj.data;
  delete req.obj.data;
  req.obj.programs = programs;
  next();
});

module.exports = { getProgreamNames };
