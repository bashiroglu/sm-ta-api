const express = require("express");
const { sendRes } = require("../../utils/helpers");
const {
  getCurrentUser,
  createTokenAndSignIn,
  updatePassword,
  restrictTo,
} = require("../../controllers/authController");

const adminRouter = require("./routers/admin");
const managerRouter = require("./routers/manager");
const teacherRouter = require("./routers/teacher");
const studentRouter = require("./routers/student");
const { roles } = require("../../utils/constants/enums");

const router = express.Router();

router.get("/get-user", getCurrentUser, createTokenAndSignIn, sendRes);
router.patch("/update-password", updatePassword, createTokenAndSignIn, sendRes);

const { ADMIN, MANAGER, TEACHER, STUDENT } = roles;

router.use("/admin", restrictTo([ADMIN]), adminRouter);
router.use("/manager", restrictTo([MANAGER, ADMIN]), managerRouter);
router.use("/teacher", restrictTo([TEACHER, ADMIN]), teacherRouter);
router.use("/student", restrictTo([STUDENT, ADMIN]), studentRouter);

module.exports = router;
