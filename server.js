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
var id;

 function chooseFunction() {
  roles = getRoles();
  employees = getEmployees();
  departments = getDepartmentNames();
  const choiceQuestions = {
    type: 'list',
    message: 'What would you like to do?',
    name: 'choice',
    choices: ['View All Departments', 'View All Roles', 'View All Employees', 'View Employees By Manager', 'Add a Department', 'Add a Role', 'Add an Employee', 'Update an Employee Role', 'Total Budget By Department', 'Quit'],
  };

     inquirer.prompt(choiceQuestions
      
    ).then((functionChoice) => {
      switch (functionChoice.choice) {
        case "View All Departments":
          db.query(`SELECT * FROM department`, function (err, results) {
            console.log("\n");
            
            console.table(results);
            console.log("\n");
            console.log("\n");
            console.log("\n");
            console.log("\n");
            console.log("\n");
            console.log("\n");
          });
          chooseFunction();
          break;
        case "View All Employees":
          db.query(
            `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, " ", m.last_name) as m FROM employee INNER JOIN role ON employee.role_id=role.id INNER JOIN department ON department.id=role.department_id LEFT JOIN employee m on m.id=employee.manager_id`,
            function (err, results) {
             
              console.log("\n");
              console.table(results);
              console.log("\n");
              console.log("\n");
              console.log("\n");
              console.log("\n");
              console.log("\n");
              console.log("\n");
            }
          );
          chooseFunction();
          break;
        case "View All Roles":
          db.query(
            `SELECT role.id, role.title, department.name AS department, role.salary FROM role INNER JOIN department ON role.department_id=department.id`,
            function (err, results) {
              console.log("\n");
              
              console.table(results);
              console.log("\n");
              console.log("\n");
              console.log("\n");
              console.log("\n");
              console.log("\n");
              console.log("\n");
              console.log("\n");
            }
          );
          chooseFunction();
          break;
        case "Add a Department":
          addDepartment();
          break;
        case "Add an Employee":
          addEmployee();
          break;
        case "Add a Role":
          addRole();
          break;
        case "Update an Employee Role":
          updateEmployeeRole();
          // chooseOption();
          break;
        case "Quit":
          quit();
          break;
        default:
          return "";
        case "View Employees By Manager":
          connection.query(
            `SELECT CONCAT(employee.first_name, " ", employee.last_name) AS name,  CONCAT(manager.first_name, " ", manager.last_name) as manager FROM employee LEFT JOIN employee manager on manager.id=employee.manager_id`,
            function (err, results) {
              console.log("\n");
              console.table(results);
            }
          );
          chooseFunction();
          break;
          case "Total Budget By Department":
            totalBudgetDept();
            break;
          case "Delete Department":
            deleteDepartment();
            break;
          case "Delete Role":
            deleteRole();
            break;
      }
    }     
    );
}

function updateEmployeeRole() {
  const questions = [
    {
      type: "list",
      message: "Which employee's role do you want to update?",
      name: "employee_id",
      choices: employees,
    },
    {
      type: "list",
      message: "Which role do you want to assign the selected employee?",
      name: "employee_role",
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
        db.query(
          `SELECT id FROM role WHERE title="${answers.employee_role}"`,
          function (err, results) {
            console.log("\n");
            // console.log(results);
            id = results[0].id;
            db.query(
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

function totalBudgetDept() {
  console.log("departments", departments);
  const question = [
    {
      type: "list",
      message: "Which department do you want view a total budget for?",
      name: "department",
      choices: departments,
    },
  ];
  inquirer.prompt(question).then((answer) => {
    console.log(answer);
    db.query(
      `SELECT department.name as department, SUM(role.salary) as total_salary FROM role INNER JOIN department ON department_id=department.id GROUP BY department.name;`,
      function (err, results) {
        console.log('\n');
        console.table(results);
        console.log('\n');
        console.log('\n');
        console.log('\n');
        console.log('\n');
        
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
      type: "list",
      message: "What is the employee's role?",
      name: "role",
      choices: roles,
    },
    {
      type: "list",
      message: "Who is the employee's manager?",
      name: "manager_id",
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
    chooseFunction();
  });
}

function getRoles() {
  db.query("SELECT * FROM role", function (err, results) {
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

function deleteDepartment() {
  const question = [
    {
      type: "list",
      message: "Which department would you like to delete?",
      name: "department",
      choices: departments,
    },
  ];
  inquirer.prompt(question).then((answers) => {
    db.query(
      `DELETE FROM department WHERE department.name="${answers.department}"`,
      function (err, results) {
        console.log(`${answers.department} deleted successfully!`);
      }
    );
    chooseFunction();
  });
}

function getDepartmentNames() {
  departments = [];
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
    choices: departments
  }
];


   inquirer.prompt(roleQuestions).then((roleInfo) => {
    db.query(
      `SELECT id FROM department WHERE name="${roleInfo.roleDepartment}"`,
      function (err, results) {
        console.log("\n");
        // console.log(results);
        id = results[0].id;
        db.query(
          `INSERT INTO role (title, salary, department_id) VALUES (${`"${roleInfo.roleName}",${roleInfo.roleSalary},${id}`})`,
          function (err, results) {
            console.log(`\n Added ${roleInfo.roleName} to the role table`);
          }
        );
      }
    );
  
    chooseFunction();
  } );

}

function deleteRole() {
 
  const question = [
    { 
      type: "list",
      message: "Which role would you like to delete?",
      name: "role",
      choices: roles,
    },
  ];
  inquirer.prompt(question).then((answers) => {
    
    connection.query(
      `DELETE FROM role WHERE role.title="${answers.role}"`,
      function (err, results) {
        console.log(`${answers.role} deleted successfully!`);
      }
    );
    chooseFunction();
  });
}

function init() {
  roles = getRoles();
  employees = getEmployees();
  departments = getDepartmentNames();
  chooseFunction();
}


init();