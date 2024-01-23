const mongoose = require("mongoose");
const Model = require("../models/enrollmentModel");
const GroupModel = require("../models/groupModel");
const ProgramModel = require("../models/programModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const createEnrollments = catchAsync(async (req, res, next) => {
  let {
    body: { students, program },
    params: { id },
    session,
  } = req;

  if (!students || !students.length) return next();

  const group = id || mongoose.Types.ObjectId();
  const programDoc = id
    ? (await GroupModel.findById(id).populate("program"))?.program
    : await ProgramModel.findById(program);

  if (!programDoc) return next(new AppError("doc_not_found", 404));
  const { lessonCount, permissionCount } = programDoc;

  const groupStudents = students.map((student) => ({
    student,
    group,
    lessonCount,
    permissionCount,
  }));

  await Model.create(groupStudents, session ? { session } : null);

  if (id) req.popOptions = GroupModel.schema.statics.studentsPopOpts;
  else req.body._id = group;

  next();
});

const prepareEnrollment = catchAsync(async (req, res, next) => {
  const { program } = await GroupModel.findById(req.body.group).populate(
    "program"
  );
  if (!program) return next(new AppError("doc_not_found", 404));
  const { lessonCount, permissionCount } = program;
  req.body.lessonCount = lessonCount;
  req.body.permissionCount = permissionCount;
  next();
});

const handleStudentPayment = async (req) => {
  let {
    body: { relatedTo, lessonCount, permissionCount, group },
    session,
  } = req;
  const filter = { student: relatedTo, group };
  const popOptions = ["student", { path: "group", populate: "program" }];
  const enrollment = await Model.findOne(filter).populate(popOptions);
  if (!enrollment) return { message: "enrollment_not_found" };

  const { lessonCount: progLessonCount, permissionCount: progPermissionCount } =
    enrollment.group.program;

  enrollment.lessonCount += lessonCount || progLessonCount;
  enrollment.permissionCount = permissionCount || progPermissionCount;
  enrollment.save(session);
  req.body.branch = enrollment.group.branch;
  return enrollment;
};

module.exports = {
  createEnrollments,
  prepareEnrollment,
  handleStudentPayment,
};
