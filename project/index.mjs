import inquirer from 'inquirer';
import consoleTable from 'console.table';
import db from './db.mjs'; 

// Main menu function
function mainMenu() {
  inquirer.prompt({
    name: 'action',
    type: 'list',
    message: 'What would you like to do?',
    choices: [
      'View All Departments',
      'View All Roles',
      'View All Employees',
      'Add a Department',
      'Add a Role',
      'Add an Employee',
      'Update an Employee Role',
      'Exit'
    ]
  }).then(answer => {
    switch (answer.action) {
      case 'View All Departments':
        viewAllDepartments();
        break;
      case 'View All Roles':
        viewAllRoles();
        break;
      case 'View All Employees':
        viewAllEmployees();
        break;
      case 'Add a Department':
        addDepartment();
        break;
      case 'Add a Role':
        addRole();
        break;
      case 'Add an Employee':
        addEmployee();
        break;
      case 'Update an Employee Role':
        updateEmployeeRole();
        break;
      case 'Exit':
        db.end();
        console.log('Goodbye!');
        break;
    }
  });
}

// View all departments
async function viewAllDepartments() {
  try {
    const [departments] = await db.query('SELECT * FROM department');
    console.table(departments);
  } catch (err) {
    console.error('Error viewing all departments', err);
  }
  mainMenu();
}

// View all roles
async function viewAllRoles() {
  try {
    const [roles] = await db.query(`
      SELECT role.id, role.title, department.name AS department, role.salary
      FROM role
      INNER JOIN department ON role.department_id = department.id
    `);
    console.table(roles);
  } catch (err) {
    console.error('Error viewing all roles', err);
  }
  mainMenu();
}

// View all employees
async function viewAllEmployees() {
  try {
    const [employees] = await db.query(`
      SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, 
      CONCAT(m.first_name, ' ', m.last_name) AS manager
      FROM employee e
      LEFT JOIN role ON e.role_id = role.id
      LEFT JOIN department ON role.department_id = department.id
      LEFT JOIN employee m ON e.manager_id = m.id
    `);
    console.table(employees);
  } catch (err) {
    console.error('Error viewing all employees', err);
  }
  mainMenu();
}

// Add a department
async function addDepartment() {
  try {
    const { departmentName } = await inquirer.prompt({
      name: 'departmentName',
      type: 'input',
      message: 'What is the name of the new department?'
    });

    await db.query('INSERT INTO department (name) VALUES (?)', departmentName);
    console.log(`Added ${departmentName} to the database`);
  } catch (err) {
    console.error('Error adding a department', err);
  }
  mainMenu();
}

// Implement addRole, addEmployee, updateEmployeeRole
async function addRole() {
    const [departments] = await db.query('SELECT id, name FROM department');
    const departmentChoices = departments.map(department => ({
      name: department.name,
      value: department.id
    }));
  
    const role = await inquirer.prompt([
      {
        name: 'title',
        type: 'input',
        message: 'What is the name of the role?'
      },
      {
        name: 'salary',
        type: 'input',
        message: 'What is the salary of the role?',
        validate: input => {
          if (isNaN(input)) {
            return 'Please enter a valid number for salary.';
          }
          return true;
        }
      },
      {
        name: 'department_id',
        type: 'list',
        message: 'Which department does the role belong to?',
        choices: departmentChoices
      }
    ]);
  
    await db.query('INSERT INTO role SET ?', {
      title: role.title,
      salary: role.salary,
      department_id: role.department_id
    });
  
    console.log(`Added new role: ${role.title}`);
    mainMenu();
  }
  async function addEmployee() {
    const [roles] = await db.query('SELECT id, title FROM role');
    const roleChoices = roles.map(role => ({
      name: role.title,
      value: role.id
    }));
  
    const [managers] = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee WHERE manager_id IS NULL');
    const managerChoices = managers.map(manager => ({
      name: manager.name,
      value: manager.id
    }));
    managerChoices.unshift({ name: 'None', value: null });
  
    const employee = await inquirer.prompt([
      {
        name: 'first_name',
        type: 'input',
        message: 'What is the employee\'s first name?'
      },
      {
        name: 'last_name',
        type: 'input',
        message: 'What is the employee\'s last name?'
      },
      {
        name: 'role_id',
        type: 'list',
        message: 'What is the employee\'s role?',
        choices: roleChoices
      },
      {
        name: 'manager_id',
        type: 'list',
        message: 'Who is the employee\'s manager?',
        choices: managerChoices
      }
    ]);
  
    await db.query('INSERT INTO employee SET ?', {
      first_name: employee.first_name,
      last_name: employee.last_name,
      role_id: employee.role_id,
      manager_id: employee.manager_id === 'None' ? null : employee.manager_id
    });
  
    console.log(`Added new employee: ${employee.first_name} ${employee.last_name}`);
    mainMenu();
  }
  async function updateEmployeeRole() {
    const [employees] = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
    const employeeChoices = employees.map(employee => ({
      name: employee.name,
      value: employee.id
    }));
  
    const [roles] = await db.query('SELECT id, title FROM role');
    const roleChoices = roles.map(role => ({
      name: role.title,
      value: role.id
    }));
  
    const answers = await inquirer.prompt([
      {
        name: 'employee_id',
        type: 'list',
        message: 'Which employee\'s role do you want to update?',
        choices: employeeChoices
      },
      {
        name: 'role_id',
        type: 'list',
        message: 'Which role do you want to assign to the selected employee?',
        choices: roleChoices
      }
    ]);
  
    await db.query('UPDATE employee SET role_id = ? WHERE id = ?', [answers.role_id, answers.employee_id]);
    console.log('Employee role updated');
    mainMenu();
  }
  
mainMenu(); // Start the application
