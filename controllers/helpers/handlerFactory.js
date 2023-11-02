const mongoose = require("mongoose");

const catchAsync = require("../../utils/catchAsync");
const { filterObject } = require("../../utils/helpers");
const createFilter = require("../../utils/createFilter");
const AppError = require("../../utils/appError");
const APIFeatures = require("../../utils/apiFeatures");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findByIdAndDelete(req.params.id);

    const features = new APIFeatures(query, req.query).filter().limitFields();

    const doc = await features.query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.makeDeletedOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findByIdAndUpdate(req.params.id, {
      deleted: true,
    });

    const features = new APIFeatures(query, req.query).filter().limitFields();

    const doc = await features.query;

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

      const query = Model.findByIdAndUpdate(req.params.id, filteredBody, {
        new: true,
        runValidators: true,
      });

      const features = new APIFeatures(query, req.query).filter().limitFields();

      req.doc = features.query;

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
    let { session, doc } = req;
    if (!session) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    req.body.createdBy = req.user.id;
    try {
      doc = await Model.create([req.body], { session });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      console.log("😀😀😀", err, "😀😀😀");
      return next(new AppError(err.meesage, 404));
    } finally {
      session.endSession();
    }

    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!req.doc) {
      const query = Model.findById(req.params.id);
      if (req.popOptions) query = query.populate(req.popOptions);

      const features = new APIFeatures(query, req.query).filter().limitFields();
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

exports.getAll = (Model, { isFiltered = false } = {}) =>
  catchAsync(async (req, res, next) => {
    let filter = isFiltered ? createFilter(req) : {};
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
