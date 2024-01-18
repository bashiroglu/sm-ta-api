const mongoose = require("mongoose");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const APIFeatures = require("../../utils/apiFeatures");
const { getCode } = require("../../utils/helpers");

module.exports = (Model) => {
  return {
    createOne: catchAsync(async (req, res, next) => {
      let { session, doc, body } = req;
      const { codeOptions } = Model.schema.statics;
      if (codeOptions) {
        if (!session) {
          session = await mongoose.startSession();
          session.startTransaction();
        }
        const code = await getCode(Model, session);
        if (!code) return next(new AppError("company_not_found", 404));
        req.body.code = code;
      }

      req.body.createdBy = req.user.id;

      if (!doc)
        doc = await Model.create(
          session ? [body] : body,
          session ? { session } : null
        );

      if (doc?.length > 0) doc = doc.at(0);

      req.status = 201;
      req.obj = { data: doc };
      next();
    }),

    getOne: catchAsync(async (req, res, next) => {
      const {
        popOptions,
        query: reqQuery,
        pipeline,
        params: { id },
      } = req;

      let query = pipeline ? pipeline : Model.findById(id);

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

    updateOne: catchAsync(async (req, res, next) => {
      let {
        params: { id },
        body,
        query: reqQuery,
        deleted,
        arrayFilters,
        filterObj,
        session,
      } = req;

      if (!session) {
        session = await mongoose.startSession();
        session.startTransaction();
        req.session = session;
      }

      let query = Model[filterObj ? "findOneAndUpdate" : "findByIdAndUpdate"](
        filterObj || id,
        body,
        {
          new: true,
          runValidators: true,
          arrayFilters,
        }
      ).session(session);

      const features = new APIFeatures(query, reqQuery).limitFields();

      const doc = await features.query;

      if (!doc)
        return next(new AppError("No document found with that ID", 404));

      req.obj = { data: deleted ? null : doc };
      next();
    }),

    deleteOne: catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      req.doc = doc;
      if (!doc) return next(new AppError("doc_not_found", 404));

      let session = req.session;
      if (!session) {
        session = await mongoose.startSession();
        session.startTransaction();
        req.session = session;
      }

      req.status = 204;
      req.obj = { data: null };
      next();
    }),
  };
};
