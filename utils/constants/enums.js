const employeeRoles = Object.freeze({
  OWNER: "owner",
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
  GUARDIAN: "guardian",
  values() {
    return Object.values(this).filter((v) => typeof v !== "function");
  },
});

// roles.values = () => Object.values(roles);

module.exports = { roles, employeeRoles };
