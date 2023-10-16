const fs = require("fs");

const getDirFileNames = (dirPath) =>
  fs.readdirSync(dirPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    return files.filter((file) => fs.statSync(dirPath + "/" + file).isFile());
  });

module.exports = { getDirFileNames };
