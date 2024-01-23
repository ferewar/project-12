CREATE DATABASE IF NOT EXISTS company_db;
USE company_db;
CREATE TABLE department (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);
CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL
);
CREATE TABLE employee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT NULL,
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL
);
INSERT INTO department (name) VALUES
('Engineering'),
('Human Resources'),
('Sales'),
('Marketing'),
('Legal');
INSERT INTO role (title, salary, department_id) VALUES
('Senior Engineer', 100000.00, 1),
('HR Manager', 60000.00, 2),
('Sales Lead', 70000.00, 3),
('Marketing Director', 80000.00, 4),
('Legal Advisor', 90000.00, 5);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, NULL),
('Jim', 'Bean', 3, 1),
('Julia', 'Roberts', 4, 2);