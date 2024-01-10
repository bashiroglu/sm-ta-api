const employeeRoles = Object.freeze({
  OWNER: "owner",
  ADMIN: "admin",
  EMPLOYEE: "employee",
  MANAGER: "manager",
  TEACHER: "teacher",
  values() {
    return Object.values(this).filter((v) => typeof v !== "function");
  },
});

const roles = Object.freeze({
  ...employeeRoles,
  ADMIN: "admin",
  STUDENT: "student",
  values() {
    return Object.values(this).filter((v) => typeof v !== "function");
  },
});

module.exports = { roles, employeeRoles };
