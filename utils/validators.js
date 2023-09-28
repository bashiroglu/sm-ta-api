exports.uniqueArrValidator = {
  validator: (arr) => {
    const s = new Set(arr.map(String));
    return s.size === arr.length;
  },
  message: (p) => {
    return `The values provided for '${p.path}', [${p.value}], contains duplicates.`;
  },
};

exports.atLeastOne = {
  validator: (arr) => arr.length,
  message: (p) => `'${p.path}' requires at least one value.`,
};
