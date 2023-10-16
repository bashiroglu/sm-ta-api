const express = require("express");
const router = express.Router();

const routes = [
  { name: "auth", fileName: "auth" },
  { name: "branches", fileName: "branch" },
  { name: "company", fileName: "company" },
  { name: "exams", fileName: "exam" },
  { name: "groups", fileName: "group" },
  { name: "lessons", fileName: "lesson" },
  { name: "packages", fileName: "package" },
  { name: "recurrences", fileName: "recurrence" },
  { name: "rooms", fileName: "room" },
  { name: "scores", fileName: "score" },
  { name: "subjects", fileName: "subject" },
  { name: "transactions", fileName: "transaction" },
  { name: "users", fileName: "user" },
  { name: "teacher", fileName: "teacher" },
];

routes.forEach(({ name, fileName }) => {
  router.use(`/${name}`, require(`./${fileName}Routes`));
});

module.exports = router;
