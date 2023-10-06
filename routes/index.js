const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const branchRoutes = require("./branchRoutes");
const companyRoutes = require("./companyRoutes");
const examRoutes = require("./examRoutes");
const groupRoutes = require("./groupRoutes");
const lessonRoutes = require("./lessonRoutes");
const packageRoutes = require("./packageRoutes");
const recurrenceRoutes = require("./recurrenceRoutes");
const roomRoutes = require("./roomRoutes");
const scoreRoutes = require("./scoreRoutes");
const subjectRoutes = require("./subjectRoutes");
const transactionRoutes = require("./transactionRoutes");
const userRoutes = require("./userRoutes");

router.use("/auth", authRoutes);
router.use("/branches", branchRoutes);
router.use("/company", companyRoutes);
router.use("/exams", examRoutes);
router.use("/groups", groupRoutes);
router.use("/lessons", lessonRoutes);
router.use("/packages", packageRoutes);
router.use("/recurrences", recurrenceRoutes);
router.use("/rooms", roomRoutes);
router.use("/scores", scoreRoutes);
router.use("/subjects", subjectRoutes);
router.use("/transactions", transactionRoutes);
router.use("/users", userRoutes);

module.exports = router;
