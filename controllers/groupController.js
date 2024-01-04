const factory = require("./helpers/handlerFactory");
const GroupModel = require("../models/groupModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getGroups = factory.getAll(GroupModel);
exports.getGroup = factory.getOne(GroupModel);
exports.createGroup = factory.createOne(GroupModel);
exports.updateGroup = factory.updateOne(GroupModel);
exports.deleteGroup = factory.deleteOne(GroupModel);

exports.crudGroupLessons = catchAsync(async (req, res, next) => {
  req.query = { group: req.params.groupId, teacher: req.query.teachers };
  if (req.method === "POST") req.body = { ...req.body, ...req.query };
  next();
});

exports.pushPullArray = catchAsync(async (req, res, next) => {
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

  req.doc = await GroupModel.findByIdAndUpdate(id, body, { new: true });
  if (!req.doc) return next(new AppError("doc_not_found", 404));
  next();
});

exports.convertStudents = catchAsync(async (req, res, next) => {
  req.body.students = req.body.students.map((student) => ({ student }));
  next();
});

exports.toggleStudentStatus = catchAsync(async (req, res, next) => {
  const {
    params: { id, studentId },
  } = req;

  const group = await GroupModel.findOne({
    _id: id,
    "students.student": studentId,
  });

  if (!group) return next(new AppError("doc_not_found", 404));

  const student = group.students.find(
    ({ student }) => String(student) === studentId
  );

  const status = student.status === "active" ? "inactive" : "active";

  req.body = {
    $set: {
      "students.$[elem].status": status,
      "students.$[elem].permissionCount": 0,
    },
  };

  req.arrayFilters = [{ "elem.student": studentId }];

  next();
});
