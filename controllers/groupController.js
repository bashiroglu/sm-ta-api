const catchAsync = require("../utils/catchAsync");
const { roles } = require("../utils/constants/enums");

const crudGroupLessons = catchAsync(async (req, res, next) => {
  req.query = { group: req.params.groupId, teacher: req.query.teachers };
  if (req.method === "POST") req.body = { ...req.body, ...req.query };
  next();
});

const checkRole = catchAsync(async (req, res, next) => {
  const {
    user: { id, roles: userRoles },
  } = req;
  if (userRoles.includes(roles.TEACHER)) req.query.teacher = id;
  next();
});

module.exports = {
  crudGroupLessons,
  checkRole,
};
