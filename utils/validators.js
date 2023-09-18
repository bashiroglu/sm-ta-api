exports.uniqueArrValidator = {
  validator: (arr) => {
    const s = new Set(arr.map(String));
    console.log(arr);
    console.log(arr);
    console.log(arr);
    console.log("validator");
    console.log("validator");
    console.log("validator");
    console.log("validator");
    console.log("validator");
    console.log("validator");
    console.log("validator");
    console.log("validator");
    console.log(s.size === arr.length);
    return s.size === arr.length;
  },
  message: (p) => {
    console.log("message");
    console.log("message");
    console.log("message");
    console.log("message");
    console.log("message");
    console.log("message");
    console.log(p);
    return `The values provided for '${p.path}', [${p.value}], contains duplicates.`;
  },
};

exports.atLeastOne = {
  validator: (arr) => arr.length,
  message: (p) => `'${p.path}' requires at least one value.`,
};
