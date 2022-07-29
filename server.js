require('dotenv').config();
require('console.table');

const inquirer = require('inquirer');
const mysql = require('mysql2');

// const mysqlPromise = require("mysql2/promise");



const db = mysql.createConnection({
      host: process.env.host,
      user: process.env.user,
      password: process.env.pw,
      database: process.env.db
  },
  console.log(`Connected to the employees_db database.`)
);




var departments = [];
var roles = [];
var employees = ["None"];

 function chooseFunction() {
  roles = getRoles();
  employees = getEmployees();
  departments = getDepartmentNames();
  const choiceQuestions = {
    type: 'list',
    message: 'What would you like to do?',
    name: 'choice',
    choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add a Department', 'Add a Role', 'Add an Employee', 'Update an Employee Role', 'Quit'],
  };

     inquirer.prompt(choiceQuestions
      
    ).then((functionChoice) => {
      switch (functionChoice.choice) {
        case "View All Departments":
          db.query(`SELECT * FROM department`, function (err, results) {
            console.log("\n");
            console.table(results);
            console.log("\n");
          });
          chooseFunction();
          break;
        case "View All Employees":
          db.query(
            `SELECT * FROM employee`,
            function (err, results) {
              console.log("\n");
              console.table(results);
              console.log("\n");
            }
          );
          chooseFunction();
          break;
        case "View All Roles":
          db.query(
            `SELECT * FROM role`,
            function (err, results) {
              console.log("\n");
              console.table(results);
              console.log("\n");
            }
          );
          chooseFunction();
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
        // case "View Employees By Manager":
        //   connection.query(
        //     `SELECT CONCAT(employee.first_name, " ", employee.last_name) AS name,  CONCAT(manager.first_name, " ", manager.last_name) as manager FROM employee LEFT JOIN employee manager on manager.id=employee.manager_id`,
        //     function (err, results) {
        //       console.log("\n");
        //       console.table(results);
        //     }
        //   );
        //   chooseFunction();
        //   break;
        default:
          return "";
      }

        // if (functionChoice.choice === 'View All Departments') {
        //      db.query('SELECT * FROM department', function (err, results) {
        //         console.table(results);
        //       });
        //       chooseFunction();

        // } else if (functionChoice.choice === 'View All Roles') {
        //    db.query('SELECT * FROM role', function (err, results) {
        //       console.table(results);
        //     });
        //     chooseFunction();
        // } else if (functionChoice.choice === 'View All Employees') {
        //      db.query('SELECT * FROM employee', function (err, results) {
        //         console.table(results);
        //       });
        //       chooseFunction();
        // } else if (functionChoice.choice === 'Add a Department') {
        //     addDepartment();
        // } else if (functionChoice.choice === 'Add a Role') {
        //     addRole();
        // } else if (functionChoice.choice === 'Add an Employee') {
        //   addEmployee();
        // } else if (functionChoice.choice === ' Update an Employee Role') {
        //   updateEmployeeRole();
        // } else if (functionChoice.choice === 'Quit') {
        //   console.log("Goodbye!~");
        //   return;
        // }
    }     
    );
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
    db.query(
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
    chooseFunction();
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
    db.query(
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
    chooseFunction();
    // break;
  });
}

function getEmployees() {
  employees = ["None"];
   db.query("SELECT * FROM employee", function (err, results) {
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

function addEmployeeWManager(answers, roleId) {
  db.query(
    `SELECT id FROM employee WHERE first_name="${
      answers.manager_id.split(" ")[0]
    }" AND last_name="${answers.manager_id.split(" ")[1]}"`,
    function (err, results) {
      employeeId = results[0].id;
      connection.query(
        `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (${`"${answers.first_name}","${answers.last_name}",${roleId}, ${employeeId}`})`,
        function (err, results) {
          console.log(`\n Added ${answers.first_name} to the employee table`);
        }
      );
    }
  );
}

 function addDepartment() {
  inquirer.prompt([{
    type: 'input',
    message: 'What is the name of the Department you would like to add?',
    name: 'departmentName',

  }]).then((inputName) => {
    db.query(`INSERT INTO department (name) VALUES ('${inputName.departmentName}');`, function (err, results) {
    });
    chooseFunction();
  } );
}

function getDepartmentNames() {
  db.query("SELECT * FROM department", function (err, results) {
    if (results) {
      results.forEach(function (department) {
        departments.push(department.name);
      });
    }
  });
  return departments;
}

 function addRole () {
  // getDepartmentNames()
  const roleQuestions = [{
    type: 'input',
    message: 'What is the name of the role you would like to add?',
    name: 'roleName',

  },
  {
    type: 'input',
    message: 'What is the salary of the role?',
    name: 'roleSalary',
  },
  {
    type: 'list',
    message: 'Which department does this role belong to?',
    name: 'roleDepartment',
    choices: getDepartmentNames()
  }
];


   inquirer.prompt(roleQuestions).then((roleInfo) => {
    db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${roleInfo.roleName}', '${roleInfo.roleSalary}', '${roleInfo.roleDepartment.id}');`, function (err, results) {
    });
    chooseFunction();
  } );

}

// chooseFunction();
function init() {
  roles = getRoles();
  employees = getEmployees();
  departments = getDepartmentNames();
  chooseFunction();
}


init();