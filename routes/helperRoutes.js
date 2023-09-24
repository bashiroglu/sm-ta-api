const express = require("express");
const { getRegisterData } = require("../controllers/helpers/helperController");

const router = express.Router();

router.route("/get-data-register").get(getRegisterData);

module.exports = router;
