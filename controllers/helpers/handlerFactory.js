const catchAsync = require("./../utils/catchAsync");
const filterObject = require("../utils/filterObject");
const createFilter = require("./../utils/createFilter");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");

const checkPermission = (slug, req) =>
  slug && !req.user.permissions.includes(slug);

const throwPermissionError = (next) =>
  next(new AppError("You do not have permission to finish this action", 403));

exports.deleteOne = (Model, { permissionSlug = null } = {}) =>
  catchAsync(async (req, res, next) => {
    if (checkPermission(permissionSlug, req)) return throwPermissionError(next);

    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.deleteMany = (Model, { permissionSlug = null } = {}) =>
  catchAsync(async (req, res, next) => {
    if (checkPermission(permissionSlug, req)) return throwPermissionError(next);

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

exports.makeDeletedOne = (Model, { permissionSlug = null } = {}) =>
  catchAsync(async (req, res, next) => {
    if (checkPermission(permissionSlug, req)) return throwPermissionError(next);

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

exports.updateOne = (
  Model,
  { permissionSlug = null, allowedFields = null } = {}
) =>
  catchAsync(async (req, res, next) => {
    if (checkPermission(permissionSlug, req)) return throwPermissionError(next);
    const filteredBody = allowedFields
      ? filterObject(req.body, allowedFields)
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

exports.createOne = (Model, { permissionSlug = null } = {}) =>
  catchAsync(async (req, res, next) => {
    if (checkPermission(permissionSlug, req)) return throwPermissionError(next);

    req.body.createdBy = req.user.id;

    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

exports.getOne = (Model, { permissionSlug = null, popOptions = null } = {}) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id).populate(popOptions);

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

exports.getAll = (Model, { permissionSlug = null, isFiltered = false } = {}) =>
  catchAsync(async (req, res, next) => {
    if (checkPermission(permissionSlug, req)) return throwPermissionError(next);

    let filter = isFiltered ? createFilter(req) : {};
    let features = new APIFeatures(Model.find(filter), req.query)
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
      total,
      results: doc.length,
      data: doc,
    });
  });
