const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const APIFeatures = require("../../utils/apiFeatures");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError("doc_not_found", 404));

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let {
      doc,
      params: { id },
      body,
      query: reqQuery,
      deleted,
    } = req;

    if (!doc) {
      let query = Model.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      });

      const features = new APIFeatures(query, reqQuery).limitFields();

      doc = await features.query;

      if (!doc) {
        return next(new AppError("No document found with that ID", 404));
      }
    }

    res.status(200).json({
      status: "success",
      data: deleted ? null : doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let { session, doc, body } = req;
    req.body.createdBy = req.user.id;
    if (!doc)
      doc = await Model.create(
        session ? [body] : body,
        session ? { session } : null
      );

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    res.status(201).json({ status: "success", data: doc });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!req.doc) {
      let query = Model.findById(req.params.id);

      if (req.popOptions) query = query.populate(req.popOptions);
      const features = new APIFeatures(query, req.query).filter().limitFields();
      req.doc = await features.query;
      if (!req.doc) return next(new AppError("doc_not_found", 404));
    }

    res.status(200).json({ status: "success", data: req.doc });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. Extract request parameters
    const { popOptions, query: requestQuery, pipeline } = req;

    if (requestQuery.archived === undefined)
      requestQuery.archived = { $ne: true };
    if (requestQuery.archived === null) requestQuery.archived = undefined;
    if (requestQuery.archived === false) requestQuery.archived = false;
    if (requestQuery.archived === true) requestQuery.archived = true;

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

    // 8. Send the response
    res.status(200).json({
      status: "success",
      total: total.length,
      results: result.length,
      data: result,
    });
  });
