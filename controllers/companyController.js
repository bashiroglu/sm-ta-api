const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const checkConstruction = catchAsync(async (req, res, next) => {
  const company = await CompanyModel.findById(process.env.COMPANY_ID);
  if (!company || company.isUnderConstruction)
    return next(new AppError("under_construction", 400));

  next();
});

const aliasSetId = (req, res, next) => {
  req.params.id = process.env.COMPANY_ID;
  next();
};

module.exports = { checkConstruction, aliasSetId };
