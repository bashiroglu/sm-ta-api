const catchAsync = require("../../utils/catchAsync");
const { filterObject } = require("../../utils/helpers");
const AppError = require("../../utils/appError");
const APIFeatures = require("../../utils/apiFeatures");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
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
    if (!req.doc) {
      const filteredBody = req.allowedFields
        ? filterObject(req.body, ...req.allowedFields)
        : req.body;

      filteredBody.updatedBy = req.user.id;
      req.doc = await Model.findByIdAndUpdate(req.params.id, filteredBody, {
        new: true,
        runValidators: true,
      });

      if (!req.doc) {
        return next(new AppError("No document found with that ID", 404));
      }
    }

    res.status(200).json({
      status: "success",
      data: req.doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!req.doc)
      req.doc = await Model.create({ ...req.body, createdBy: req.user.id });

    res.status(201).json({
      status: "success",
      data: req.doc,
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!req.doc) {
      let query = Model.findById(req.params.id);
      if (req.popOptions) query = query.populate(req.popOptions);

      const features = new APIFeatures(query, req.query).limitFields();
      req.doc = await features.query;

      if (!req.doc) {
        return next(new AppError("No document found with that ID", 404));
      }
    }

    res.status(200).json({
      status: "success",
      data: req.doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
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
