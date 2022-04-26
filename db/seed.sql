INSERT INTO department(name)
VALUES
("Human Resource Department"),
("Finance Department"),
("Operations Department")

INSERT INTO role(title, salary, department_id)
VALUES
("Recruiter", 53746, 2)
("HR Coordinator", 56092, 2)
("Director of Finance", 183811, 3)
("Customer Service", 35858, 3)
("Finance Specialist", 58316, 3)
("Operations Coordinator", 46338, 4)
("Operations Supervisor", 70037, 4)

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES
("Tyler", "Byrd", 3, NULL),
("Sue", "Gonzalez", 2, 3)
("Traci", "Briggs", 4, NULL)
("Ryan", "Carr", 5, 5)
("Matt", "Willis", 6, 5)
("Dora", "Allen", 8, NULL)
("Barry", "Norton", 7, 8)