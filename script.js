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