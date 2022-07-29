INSERT INTO department (name)
VALUES ('Managerial'),
       ('Engineering'),
       ('Sales'),
       ('HR'),
       ('Communication');

INSERT INTO role (title, salary, department_id)
VALUES ('Engineer', 100000.00, 2),
       ("Intern", 0.00, 5),
       ("Manager", 200000.00, 1),
       ("Sales Person", 120000.00, 3),
       ("Comms guy", 70000.00, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Jerome", "Manages", 3, null),
       ('Billy', 'Bob', 5, 1),
       ("I sell", 'things', 4, 1),
       ("I bust", "code", 2, 1),
       ("I fix", "busted code", 1, 1);
