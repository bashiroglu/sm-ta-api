const UserModel = require("../models/userModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");

// exports.getParents = factory.getAll(UserModel, { roles: ["parent"] });

exports.createParent = catchAsync(async (req, res, next) => {
  const {
    date,
    duration,
    eventLanguages,
    groupSize,
    guides,
    pricePerPerson,
    title,
    tour,
    tasks,
  } = req.body;

  const eventObject = {
    date,
    duration,
    eventLanguages,
    groupSize,
    guides,
    pricePerPerson,
    title,
    tour,
    // only tasks with relatedTo: 'participant' will be kept in event document
    // to create tasks for each new participants in future
    taskTemplates: tasks.filter((t) => t.relatedTo === "participant"),
  };

  // Created new event will be deleted
  // if any of the event tasks faild to be created
  const newEvent = await MgEventModel.create(eventObject);
  req.body.eventId = newEvent.id;

  // Next middleware is insertEventTasks from taskController
  next();
});

exports.getParents = catchAsync(async (req, res, next) => {
  req.query.roles = "parent";
  next();
});
