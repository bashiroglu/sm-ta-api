const Model = require("../models/groupModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { roles } = require("../utils/constants/enums");

const crudGroupLessons = catchAsync(async (req, res, next) => {
  req.query = { group: req.params.groupId, teacher: req.query.teachers };
  if (req.method === "POST") req.body = { ...req.body, ...req.query };
  next();
});

const toggleArrayEl = catchAsync(async (req, res, next) => {
  const field = req.url.split("/").at(-1);

  let {
    params: { id },
    body: { ids },
    method,
  } = req;

  if (!["students", "teachers"].includes(field))
    return next(new AppError("dont_use_this_endpoint", 400));

  if (field === "students") ids = ids.map((id) => ({ student: id }));

  const body =
    method === "DELETE"
      ? { $pull: { [field]: { $in: ids } } }
      : method === "PATCH"
      ? { $push: { [field]: { $each: ids } } }
      : {};

  req.doc = await Model.findByIdAndUpdate(id, body, { new: true });
  if (!req.doc) return next(new AppError("doc_not_found", 404));
  next();
});

const convertStudents = catchAsync(async (req, res, next) => {
  req.body.students = req.body.students.map((student) => ({ student }));
  next();
});

const checkRole = catchAsync(async (req, res, next) => {
  const { user } = req;
  if (user.roles.includes(roles.TEACHER)) req.query.teacher = user.id;
  next();
});

const updateStudent = catchAsync(async (req, res, next) => {
  const body = { $set: {} };
  ["lessonCount", "permissionCount", "status"].forEach((f) => {
    if (f in req.body) body.$set[`students.$.${f}`] = req.body[f];
  });
  req.body = body;
  req.filterObj = { "students._id": req.params.id };
  req.fields = "students";
  req.query = { "students._id": req.params.id };
  next();
});

const aliasStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  req.query["students.student"] = id;
  next();
});

module.exports = {
  crudGroupLessons,
  toggleArrayEl,
  convertStudents,
  checkRole,
  updateStudent,
  aliasStudent,
};
