// Test
console.log("READING INDEX.JS");

// MYSQL Command Line once at the directory
// mysql -u root -p

// Importing Libraries
var inquirer = require("inquirer");
const express = require("express");
const app = express();
const mysql = require("mysql2");
const cTable = require("console.table");

// Creates the port
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to Database
const db = mysql.createConnection({
  host: "localhost",
  // Username
  user: "root",
  password: "!Paranoid25!",
  database: "employeeTracker_db",
});

db.connect((err) => {
  if (err) {
    console.log("ERROR:" + err);
  }
  console.log("Connected as id " + db.threadId);
  EmployeeSection();
});

// Ask User What They Want To Do First
const EmployeeSection = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "EmployeeManagerSelection",
        choices: [
          "View All Employees",
          "View All Departments",
          "View All Roles",
          "Add Employee",
          "Add Department",
          "Add Role",
          "Update Employee Role",
          "Exit",
        ],
      },
    ])
    .then((answer) => {
      // Calls the correct function
      if (answer.EmployeeManagerSelection === "View All Employees") {
        AllEmployees();
      } else if (answer.EmployeeManagerSelection === "View All Departments") {
        AllDepartments();
      } else if (answer.EmployeeManagerSelection === "View All Roles") {
        AllRoles();
      } else if (answer.EmployeeManagerSelection === "Add Employee") {
        AddEmployee();
      } else if (answer.EmployeeManagerSelection === "Add Department") {
        AddDepartment();
      } else if (answer.EmployeeManagerSelection === "Add Role") {
        AddRole();
      } else if (answer.EmployeeManagerSelection === "Update Employee Role") {
        updateEmployee();
      } else {
        console.log("Exiting server now!");
        return "^C";
      }
    });
};

function AllEmployees() {
  // Connects to SQL Department
  const sql = `SELECT employee.id, employee.first_name, 
    employee.last_name, 
    role.title, 
    department.department_name AS department,
    role.salary, 
    CONCAT (manager.first_name, " ", manager.last_name) AS manager
FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id`;

  db.query(sql, (err, rows) => {
    // Display errors if any
    if (err) {
      console.log("ERROR:" + err);
    }

    // Displays Tables
    console.table("\n", rows);

    // Goes Back to the Menu
    EmployeeSection();
  });
}

function AllDepartments() {
  // Connects to SQL role
  const sql = "SELECT * FROM department";

  db.query(sql, (err, rows) => {
    // Display errors if any
    if (err) {
      console.log("ERROR:" + err);
    }

    // Displays Tables
    console.table("\n", rows);

    // Goes Back to the Menu
    EmployeeSection();
  });
}

function AllRoles() {
  const sql = "SELECT * FROM role";

  db.query(sql, (err, rows) => {
    // Display errors if any
    if (err) {
      console.log("ERROR:" + err);
    }

    // Displays Tables
    console.table("\n", rows);

    // Goes Back to the Menu
    EmployeeSection();
  });
}

function AddEmployee() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name",
      },
    ])
    .then((answer) => {
      const params = [answer.first_name, answer.last_name];

      const roleSql = "SELECT role.id, role.title FROM role";

      db.query(roleSql, (err, data) => {
        if (err) {
          console.log(err);
        }

        const roles = data.map(({ id, title }) => ({ name: title, value: id }));

        inquirer
          .prompt([
            {
              type: "list",
              name: "role_id",
              choices: roles,
              message: "What is the employee's role?",
            },
          ])
          .then((roleChoice) => {
            const role = roleChoice.role_id;
            params.push(role);

            const managerSql = `SELECT * FROM employee`;

            db.query(managerSql, (err, data) => {
              if (err) {
                console.log(err);
              }

              const managers = data.map(({ id, first_name, last_name }) => ({
                name: first_name + " " + last_name,
                value: id,
              }));

              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "manager_id",
                    choices: managers,
                    message: "Who is the employee's manager?",
                  },
                ])
                .then((managerChoice) => {
                  const manager = managerChoice.manager_id;
                  params.push(manager);

                  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES (?, ?, ?, ?)`;

                  db.query(sql, params, (err, result) => {
                    if (err) {
                      console.log(err);
                    }

                    console.log("Employee has been added!");
                    // Goes Back to the Menu
                    EmployeeSection();
                  });
                });
            });
          });
      });
    });
}

function AddDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "departmentName",
        message: "What is the new department name?",
      },
    ])
    .then((answer) => {
      const sql = `INSERT INTO department (department_name)
    VALUES (?)`;

      db.query(sql, answer.departmentName, (err, result) => {
        if (err) {
          console.log(err);
        }

        console.log("Department " + answer.departmentName + " has been added!");
      });

      // Goes Back to the Menu
      EmployeeSection();
    });
}

function AddRole() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "role",
        message: "What is the new role name?",
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary?",
      },
    ])
    .then((answer) => {
      const params = [answer.role, answer.salary];

      const roleSql = `SELECT department_name, id FROM department`;

      db.query(roleSql, (err, data) => {
        if (err) {
          console.log(err);
        }

        const dept = data.map(({ department_name, id }) => ({
          name: department_name,
          value: id,
        }));

        inquirer
          .prompt([
            {
              type: "list",
              name: "dept",
              message: "What department does this role belong in?",
              choices: dept,
            },
          ])
          .then((deptAnswer) => {
            const dept = deptAnswer.dept;
            params.push(dept);

            const sql = `INSERT INTO role (title, salary, department_id)
          VALUES (?, ?, ?)`;

            db.query(sql, params, (err, result) => {
              if (err) {
                console.log(err);
              }

              console.log(deptAnswer.dept + " has been added!");

              // Goes Back to the Menu
              EmployeeSection();
            });
          });
      });
    });
}

function updateEmployee() {
  const employeeSql = `SELECT * FROM employee`;

  db.query(employeeSql, (err, data) => {
    if (err) {
      console.log(err);
    }

    const employees = data.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "Which employee did you want to update?",
          choices: employees,
        },
      ])
      .then((answer) => {
        const employee = answer.name;
        const params = [];
        params.push(employee);

        const roleSql = `SELECT * FROM role`;

        db.query(roleSql, (err, data) => {
          if (err) {
            console.log(err);
          }

          const roles = data.map(({ id, title }) => ({
            name: title,
            value: id,
          }));

          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message: "What is the employee's new role?",
                choices: roles,
              },
            ])
            .then((roleAnswer) => {
              const role = roleAnswer.role;
              params.push(role);

              let employee = params[0];
              params[0] = role;
              params[1] = employee;

              const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

              db.query(sql, params, (err, result) => {
                if (err) {
                  console.log(err);
                }

                console.log("Employee has been updated!");

                EmployeeSection();
              });
            });
        });
      });
  });
}
