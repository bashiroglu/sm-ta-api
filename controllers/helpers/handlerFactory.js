const mongoose = require("mongoose");

const catchAsync = require("../../utils/catchAsync");
const { filterObject } = require("../../utils/helpers");
const AppError = require("../../utils/appError");
const APIFeatures = require("../../utils/apiFeatures");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("doc_not_found", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.makeDeletedOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(
      req.params.id,
      {
        deleted: true,
      },
      { new: true }
    );

    if (!doc) {
      return next(new AppError("doc_not_found", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!req.doc) {
      req.doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!req.doc) return next(new AppError("doc_not_found", 404));
    }

    res.status(200).json({
      status: "success",
      data: req.doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let { session, doc } = req;
    req.body.createdBy = req.user.id;
    if (!doc)
      if (session) {
        doc = await Model.create([req.body], { session });
        await session.commitTransaction();
        session.endSession();
      } else doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!req.doc) {
      let query = Model.findById(req.params.id);
      if (req.popOptions) query = query.populate(req.popOptions);

      const features = new APIFeatures(query, req.query).filter().limitFields();
      req.doc = (await features.query)?.at(0);

      if (!req.doc) {
        return next(new AppError("doc_not_found", 404));
      }
    }

    res.status(200).json({
      status: "success",
      data: req.doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. Extract request parameters
    const { popOptions, query: requestQuery, pipeline, sortBy } = req;
    console.log(pipeline);
    // 2. Build the initial query
    let query = pipeline ? pipeline : Model.find();

    // 3. Populate specified fields if popOptions are provided
    if (popOptions) query = query.populate(popOptions);

    // 4. Create APIFeatures instance for query filtering, sorting, and field limiting
    const features = new APIFeatures(query, requestQuery)
      .filter()
      .sort()
      .limitFields();

    // 5. Execute the initial query to get the total count
    const total = await features.query;

    // 6. Paginate the results
    const paginatedFeatures = features.paginate();

    // 7. Execute the final query
    const result = await paginatedFeatures.query;

    console.log(result);

    // 8. Send the response
    res.status(200).json({
      status: "success",
      total: total.length,
      results: result.length,
      data: result,
    });
  });
