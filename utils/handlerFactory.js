const catchAsync = require("./catchAsync");
const AppError = require("./appError");
const APIFeatures = require("./apiFeatures");
const { getCode, startTransSession } = require("./helpers");

module.exports = (Model) => {
  return {
    createOne: catchAsync(async (req, res, next) => {
      let { session, body, docCount } = req;
      const { codeOptions } = Model.schema.statics;
      if (codeOptions && !body.code) {
        session = await startTransSession(req);
        const code = await getCode(Model, session);
        if (!code) return next(new AppError("company_not_found", 404));
        req.body.code = code;
      }

      req.body.createdBy = req.user.id;

      const doc = await Model.create(
        docCount || !session ? body : [body],
        session ? { session } : null
      );

      if (!doc) return next(new AppError("cannot be created", 400));

      req.status = 201;
      req.resObj = { data: docCount || !session ? doc : doc.at(0) };
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
      const features = new APIFeatures(query, reqQuery).limitFields();
      const doc = await features.query;
      if (!doc) return next(new AppError("doc_not_found", 404));

      req.resObj = { data: doc };
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
      req.resObj = {
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
        session,
      } = req;

      if (id.constructor === String) id = { _id: id };

      // this code prevents update deleted
      // field not via makedeleted middleware
      if (deleted in body) {
        if (body.makeDeleted === process.env.MAKE_DELETED_SECRET) body = {};
        else return next(new AppError("dont_use_this_endpoint", 404));
      }

      session = await startTransSession(req);
      let query = Model.findOneAndUpdate(id, body, {
        new: true,
        runValidators: true,
        arrayFilters,
      });
      if (session) query.session(session);

      const features = new APIFeatures(query, reqQuery).limitFields();

      const doc = await features.query;
      if (!doc)
        return next(new AppError("No document found with that ID", 404));

      req.resObj = { data: deleted ? null : doc };
      next();
    }),

    deleteOne: catchAsync(async (req, res, next) => {
      let session = req.session;
      session = await startTransSession(req);

      const doc = await Model.findByIdAndDelete(req.params.id);
      req.doc = doc;
      if (!doc) return next(new AppError("doc_not_found", 404));

      req.status = 204;
      req.resObj = { data: null };
      next();
    }),
  };
};
