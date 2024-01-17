const catchAsync = require("./catchAsync");
const AppError = require("./appError");
const APIFeatures = require("./apiFeatures");

module.exports = (Model) => {
  return {
    deleteOne: catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return next(new AppError("doc_not_found", 404));

      req.status = 204;
      req.obj = { data: null };
      next();
    }),

    updateOne: catchAsync(async (req, res, next) => {
      let {
        params: { id },
        body,
        query: reqQuery,
        filterObj,
      } = req;

      let query = Model[filterObj ? "findOneAndUpdate" : "findByIdAndUpdate"](
        filterObj || id,
        body,
        { new: true, runValidators: true }
      );

      const features = new APIFeatures(query, reqQuery).limitFields();

      const doc = await features.query;

      if (!doc) return next(new AppError("doc_not_faund", 404));

      req.obj = { data: body.deleted ? null : doc };
      next();
    }),

    createOne: catchAsync(async (req, res, next) => {
      let {
        session,
        body,
        user: { id },
      } = req;

      req.body.createdBy = id;
      let doc = await Model.create(
        session ? [body] : body,
        session ? { session } : null
      );

      if (session) {
        await session.commitTransaction();
        session.endSession();
      }

      if (doc?.length > 0) doc = doc.at(0);

      req.status = 201;
      req.obj = { data: doc };
      next();
    }),

    getOne: catchAsync(async (req, res, next) => {
      const {
        params: { id },
        popOptions,
        query: reqQuery,
      } = req;
      let query = Model.findById(id);
      if (popOptions) query = query.populate(popOptions);
      const features = new APIFeatures(query, reqQuery).filter().limitFields();
      const doc = await features.query;
      if (!doc) return next(new AppError("doc_not_found", 404));

      req.obj = { data: doc };
      next();
    }),

    getAll: catchAsync(async (req, res, next) => {
      // 1. Extract request parameters
      const { popOptions, query: reqQuery, pipeline } = req;

      if (reqQuery.archived === undefined) reqQuery.archived = { $ne: true };
      if (reqQuery.archived === null) reqQuery.archived = undefined;
      if (reqQuery.archived === false) reqQuery.archived = false;
      if (reqQuery.archived === true) reqQuery.archived = true;

      // 2. Build the initial query
      let query = pipeline ? pipeline : Model.find();

      // 3. Populate specified fields if popOptions are provided
      if (popOptions) query = query.populate(popOptions);

      // 4. Create APIFeatures instance for query filtering, sorting, and field limiting
      const features = new APIFeatures(query, reqQuery)
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
      req.obj = {
        total: total.length,
        results: result.length,
        data: result,
      };
      next();
    }),
  };
};
