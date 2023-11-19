exports.uniqueArrValidator = {
  validator: (arr) => new Set(arr.map(String)).size === arr.length,
  message: "exist_dublicates",
};

exports.atLeastOne = {
  validator: (arr) => arr.length,
  message: "at_least_one",
};
