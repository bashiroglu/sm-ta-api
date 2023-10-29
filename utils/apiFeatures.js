class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(isPipeline) {
    if (isPipeline) return this;
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in)\b/g,
      (match) => `$${match}`
    );

    const parsed = JSON.parse(queryStr);
    if (queryStr.includes("$in"))
      Object.keys(parsed).forEach(
        (k) => (parsed[k]["$in"] = parsed[k]["$in"].split(","))
      );

    if (parsed.query) parsed.query = new RegExp(parsed.query, "i");
    if (parsed.code) parsed.code = new RegExp(parsed.code, "i");

    this.query = this.query.find(parsed);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields(isPipeline) {
    if (isPipeline) return this;
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate(isPipeline) {
    const page = this.queryString.page * 1;
    const limit = this.queryString.limit * 1;
    const skip = (page - 1) * limit;
    if (isPipeline && (!page || !limit)) return this;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
