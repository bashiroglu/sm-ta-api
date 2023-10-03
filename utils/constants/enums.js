exports.employeeRoles = Object.freeze({
  OWNER: "owner",
  EMPLOYEE: "employee",
  MANAGER: "manager",
  TEACHER: "teacher",
});

exports.roles = Object.freeze({
  ...module.employeeRoles,
  ADMIN: "admin",
  STUDENT: "student",
  GUARDIAN: "guardian",
});
