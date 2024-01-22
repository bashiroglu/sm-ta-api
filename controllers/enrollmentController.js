const mongoose = require("mongoose");
const Model = require("../models/enrollmentModel");
const GroupModel = require("../models/groupModel");
const ProgramModel = require("../models/programModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { notify } = require("../utils/helpers");
const { studentPaymentText } = require("../utils/contents");

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
    body: {
      category,
      relatedTo,
      lessonCount,
      permissionCount,
      smsNotification,
      amount,
    },
    session,
  } = req;

  if (category !== process.env.STUDENT_PAYMENT_CATEGORY_ID) return true;

  const filter = { student: relatedTo, group: groupId };
  const popOptions = ["student", { path: "group", populate: "program" }];
  const doc = await Model.findOne(filter).populate(popOptions);
  if (!doc) return;

  doc.lessonCount += lessonCount || doc.group.program.lessonCount;
  doc.permissionCount = permissionCount || doc.group.program.permissionCount;
  doc.save(session);

  if (smsNotification) {
    const content = studentPaymentText(amount);
    const result = await notify({
      via: "sms",
      to: doc.student?.phoneNumbers?.at(-1),
      content,
      session,
    });

    if (!result) next(new AppError("notification_failed", 400));
  }

  console.warn("Your payment has been fulfilled");
  return doc;
};

const adjustEnrollments = async (req, group, lesson, session) => {
  const {
    body: { absent, present },
  } = req;
  const { id: groupId } = group;

  const enrollments = await Model.find({ group: groupId })
    .populate(["student", { path: "group", populate: "program" }])
    .session(session);

  if (!enrollments.length)
    return { error: true, message: "enrollment_not_found" };

  const paidStudents = [];

  enrollments.forEach(async (enrollment) => {
    const { lessonCount, permissionCount, status, student } = enrollment;

    const isActive = status === "active";
    const isPresent = present.includes(String(student.id));
    const isAbsent = absent.includes(String(student.id));
    const hasPermission = permissionCount;

    if (isActive) {
      if (isPresent || !hasPermission) {
        if (lessonCount) enrollment.lessonCount -= 1;
        paidStudents.push(student);
      }
      if (isAbsent) {
        if (!hasPermission) paidStudents.push(student);
        enrollment.permissionCount = 0;
      }
    }
    enrollment.history = [
      ...enrollment.history,
      {
        lesson,
        status: isActive ? "active" : "inactive",
        lessonCount: enrollment.lessonCount,
        permissionCount: enrollment.permissionCount,
      },
    ];
    await enrollment.save({ session });
  });

  return { paidStudents };
};

module.exports = {
  createEnrollments,
  prepareEnrollment,
  handleStudentPayment,
  adjustEnrollments,
};
