const inquirer = require("inquirer");
const mysql = require("mysql2");
require("dotenv").config();
require("console.table");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "employees_db",
});

var employeeId;
var roles = [];
var departments = [];
var employees = ["None"];

function chooseOption() {
  roles = getRoles();
  employees = getEmployees();
  departments = getDepartment();
  const optionQuestion = {
    name: "option",
    message: "What would you like to do?",
    type: "list",
    choices: [
      "View All Employees",
      "View Employees By Manager",
      "Add Employee",
      "Update Employee Role",
      "View All Roles",
      "Add Role",
      "View All Departments",
      "Add Department",
      "Delete Department",
      "Delete Role",
      "Delete Employee",
      "Exit",
    ],
  };
  inquirer.prompt(optionQuestion).then((answers) => {
    switch (answers.option) {
      case "View All Departments":
        connection.query(`SELECT * FROM department`, function (err, results) {
          console.log("\n");
          console.table(results);
          console.log("\n");
        });
        chooseOption();
        break;
      case "View All Employees":
        connection.query(
          `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, " ", m.last_name) as m FROM employee INNER JOIN role ON employee.role_id=role.id INNER JOIN department ON department.id=role.department_id LEFT JOIN employee m on m.id=employee.manager_id`,
          function (err, results) {
            console.log("\n");
            console.table(results);
            console.log("\n");
          }
        );
        chooseOption();
        break;
      case "View All Roles":
        connection.query(
          `SELECT role.id, role.title, department.name AS department, role.salary FROM role INNER JOIN department ON role.department_id=department.id`,
          function (err, results) {
            console.log("\n");
            console.table(results);
            console.log("\n");
          }
        );
        chooseOption();
        break;
      case "Add Department":
        addDepartment();
        break;
      case "Add Employee":
        addEmployee();
        break;
      case "Add Role":
        addRole();
        break;
      case "Update Employee Role":
        updateEmployeeRole();
        // chooseOption();
        break;
      case "View Employees By Manager":
        connection.query(
          `SELECT CONCAT(employee.first_name, " ", employee.last_name) AS name,  CONCAT(manager.first_name, " ", manager.last_name) as manager FROM employee LEFT JOIN employee manager on manager.id=employee.manager_id`,
          function (err, results) {
            console.log("\n");
            console.table(results);
          }
        );
        chooseOption();
        break;
      default:
        return "";
    }
  });
}
function updateEmployeeRole() {
  const questions = [
    {
      name: "employee_id",
      message: "Which employee's role do you want to update?",
      type: "list",
      choices: employees,
    },
    {
      name: "employee_role",
      message: "Which role do you want to assign the selected employee?",
      type: "list",
      choices: roles,
    },
  ];
  inquirer.prompt(questions).then((answers) => {
    connection.query(
      `SELECT id FROM employee WHERE first_name="${
        answers.employee_id.split(" ")[0]
      }" AND last_name="${answers.employee_id.split(" ")[1]}"`,
      function (err, results) {
        console.log("\n");
        employeeId = results[0].id;
        connection.query(
          `SELECT id FROM role WHERE title="${answers.employee_role}"`,
          function (err, results) {
            console.log("\n");
            console.log(results);
            id = results[0].id;
            connection.query(
              `UPDATE employee SET role_id='${id}' WHERE id='${employeeId}'`,
              function (err, results) {
                console.log(
                  `\n Updated ${
                    answers.employee_id.split(" ")[0]
                  } to the employee table`
                );
              }
            );
          }
        );
      }
    );
    chooseOption();
  });
}
function addDepartment() {
  const questions = [
    { name: "department_name", message: "What is the name of the department?" },
  ];
  inquirer.prompt(questions).then((answers) => {
    connection.query(
      `INSERT INTO department (name) VALUES (${`"${answers.department_name}"`})`,
      function (err, results) {
        console.log(`\n Added ${answers.department_name} to the database`);
      }
    );
    chooseOption();
    // break;
  });
}
function addEmployee() {
  const questions = [
    { name: "first_name", message: "What is the employee's first name?" },
    { name: "last_name", message: "What is the employee's last name?" },
    {
      name: "role",
      message: "What is the employee's role?",
      type: "list",
      choices: roles,
    },
    {
      name: "manager_id",
      message: "Who is the employee's manager?",
      type: "list",
      choices: employees,
    },
  ];
  inquirer.prompt(questions).then((answers) => {
    connection.query(
      `SELECT id FROM role WHERE title="${answers.role}"`,
      function (err, results) {
        id = results[0].id;
        if (answers.manager_id === "None") {
          connection.query(
            `INSERT INTO employee (first_name, last_name, role_id) VALUES ("${answers.first_name}","${answers.last_name}","${id}")`,
            function (err, results) {
              console.log(
                `\n Added ${answers.first_name} to the employee table`
              );
            }
          );
        } else {
          addEmployeeWManager(answers, id);
        }
      }
    );
    // employees = getEmployees();
    chooseOption();
    // break;
  });
}

function addEmployeeWManager(answers, roleId) {
  connection.query(
    `SELECT id FROM employee WHERE first_name="${
      answers.manager_id.split(" ")[0]
    }" AND last_name="${answers.manager_id.split(" ")[1]}"`,
    function (err, results) {
      employeeId = results[0].id;
      connection.query(
        `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (${`"${answers.first_name}","${answers.last_name}",${roleId}, ${employeeId}`})`,
        function (err, results) {
          console.log(`\n Added ${answers.first_name} to the emloyee table`);
        }
      );
    }
  );
}
var id;
function addRole() {
  const questions = [
    { name: "role_name", message: "What is the name of the role?" },
    { name: "salary", message: "What is the salary of the role?" },
    {
      name: "department",
      message: "What department does the role belong to?",
      type: "list",
      choices: departments,
    },
  ];
  inquirer.prompt(questions).then((answers) => {
    connection.query(
      `SELECT id FROM department WHERE name="${answers.department}"`,
      function (err, results) {
        console.log("\n");
        console.log(results);
        id = results[0].id;
        connection.query(
          `INSERT INTO role (title, salary, department_id) VALUES (${`"${answers.role_name}",${answers.salary},${id}`})`,
          function (err, results) {
            console.log(`\n Added ${answers.role_name} to the role table`);
          }
        );
      }
    );
    chooseOption();
    // break;
  });
}
function getDepartment() {
  connection.query("SELECT * FROM department", function (err, results) {
    if (results) {
      results.forEach(function (department) {
        departments.push(department.name);
      });
    }
  });
  return departments;
}
function getRoles() {
  connection.query("SELECT * FROM role", function (err, results) {
    if (results) {
      results.forEach(function (role) {
        roles.push(role.title);
      });
    }
  });
  return roles;
}
function getEmployees() {
  employees = ["None"];
  connection.query("SELECT * FROM employee", function (err, results) {
    if (results) {
      results.forEach(function (employee) {
        employees.push(`${employee.first_name} ${employee.last_name}`);
      });
    } else {
      console.error(err);
    }
  });
  return employees;
}
function logTable(stmt) {}
function init() {
  roles = getRoles();
  employees = getEmployees();
  departments = getDepartment();
  chooseOption();
}
init();