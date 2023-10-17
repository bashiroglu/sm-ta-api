const catchAsync = require("../../utils/catchAsync");
const { filterObject } = require("../../utils/helpers");
const AppError = require("../../utils/appError");
const APIFeatures = require("../../utils/apiFeatures");

const checkPermission = (req, next) => {
  if (req.slug && !req.user?.permissions.includes(req.slug))
    next(new AppError("You do not have permission to finish this action", 403));
};

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    checkPermission(req, next);

    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.deleteMany = (Model) =>
  catchAsync(async (req, res, next) => {
    checkPermission(req, next);

    const { ids } = req.body;
    const doc = await Model.deleteMany({ _id: { $in: req.body.ids } });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.archiveOne = (Model) =>
  catchAsync(async (req, res, next) => {
    checkPermission(req, next);

    const doc = await Model.findByIdAndUpdate(req.params.id, {
      archived: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    checkPermission(req, next);
    const filteredBody = req.allowedFields
      ? filterObject(req.body, ...req.allowedFields)
      : req.body;

    filteredBody.updatedBy = req.user.id;
    const doc = await Model.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    checkPermission(req, next);

    if (password)
      req.body.password = req.body.passwordConfirm =
        process.env.DEFAULT_USER_PASSWORD;
    req.body.createdBy = req.user.id;

    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (req.popOptions) query = query.populate(req.popOptions);

    const features = new APIFeatures(query, req.query).limitFields();
    const doc = await features.query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    checkPermission(req, next);

    let filter;
    if (req.ids) filter = { _id: { $in: req.ids } };

    let query = Model.find(filter);

    if (req.popOptions) query = query.populate(req.popOptions);

    let features = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .limitFields();
    const total = await features.query;

    features = features.paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      total: total.length,
      results: doc.length,
      data: doc,
    });
  });
