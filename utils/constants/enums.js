const employeeRoles = Object.freeze({
  OWNER: "owner",
  EMPLOYEE: "employee",
  MANAGER: "manager",
  TEACHER: "teacher",
});

const roles = Object.freeze({
  ...employeeRoles,
  ADMIN: "admin",
  STUDENT: "student",
  GUARDIAN: "guardian",
});

module.exports = { roles, employeeRoles };
