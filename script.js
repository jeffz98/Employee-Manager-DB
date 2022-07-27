require('.dotenv').config();
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

function chooseFunction() {
    inquirer.prompt(
      [
      {
        type: 'list',
        message: 'What would you like to do?',
        name: 'choice',
        choices: ['View All Departments', 'View All Roles', 'View all Employees', 'Add a Department', 'Add a Role', 'Add an Employee', 'Update an Employee Role']
      },
      ]
    ).then((functionChoice) => {
        if (functionChoice.choice === 'View All Departments') {
            db.query('SELECT * FROM employees', function (err, results) {
                console.log(results);
              });
        } else if (functionChoice.choice === 'View All Employees') {
            db.query('SELECT COUNT(id) AS total_count FROM favorite_books GROUP BY in_stock', function (err, results) {
                console.log(results);
              });
        }
    }     
    )
}