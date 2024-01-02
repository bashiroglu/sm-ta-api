const factory = require("./helpers/handlerFactory");
const BlogModel = require("../models/blogModel");
const catchAsync = require("../utils/catchAsync");

exports.getBlogs = factory.getAll(BlogModel);
exports.getBlog = factory.getOne(BlogModel);
exports.createBlog = factory.createOne(BlogModel);
exports.updateBlog = factory.updateOne(BlogModel);
exports.deleteBlog = factory.deleteOne(BlogModel);

exports.incrementViewCount = catchAsync(async (req, res, next) => {
  req.body = { $inc: { viewCount: 1 } };
  req.query.fields = "viewCount";
  next();
});
