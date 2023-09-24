const catchAsync = require("../utils/catchAsync");
const {
  getCountriesList,
  getRegions,
} = require("./../utils/constants/countries");

exports.getRegisterData = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    countries: getCountriesList(),
    regions: getRegions(),
  });
});
