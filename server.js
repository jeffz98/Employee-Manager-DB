require('dotenv').config();
require('console.table');

const inquirer = require('inquirer');
const mysql = require('mysql2');

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

db.query(
  `SELECT role.id, role.title, department.name AS department, role.salary FROM role INNER JOIN department ON role.department_id=department.id`,
  function (err, results) {
    console.log("\n");
    console.table(results);
  }
);

function chooseFunction() {
    inquirer.prompt(
      {
        type: 'list',
        message: 'What would you like to do?',
        name: 'choice',
        choices: ['View All Departments', 'View All Roles', 'View all Employees', 'Add a Department', 'Add a Role', 'Add an Employee', 'Update an Employee Role', 'Quit']
      },
    ).then((functionChoice) => {
        if (functionChoice.choice === 'View All Departments') {
            db.query('SELECT * FROM department', function (err, results) {
                console.table(results);
              });
              chooseFunction();

        } else if (functionChoice.choice === 'View All Roles') {
          db.query('SELECT * FROM role', function (err, results) {
              console.table(results);
            });
            chooseFunction();
        } else if (functionChoice.choice === 'View All Employees') {
            db.query('SELECT * FROM employees', function (err, results) {
                console.table(results);
              });
              chooseFunction();
        } else if (functionChoice.choice === 'Add a Department') {
            addDepartment();
        } else if (functionChoice.choice === 'Add a Role') {
            addRole();
        } else if (functionChoice.choice === 'Add an Employee') {

        } else if (functionChoice.choice === ' Update an Employee Role') {

        } else {
          console.log("Goodbye!~");
          return;
        }
    }     
    )
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

chooseFunction();