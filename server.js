const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ===== DATA FILES =====
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const MENU_FILE = path.join(__dirname, 'menu.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const EXPENSES_FILE = path.join(__dirname, 'expenses.json');
const SALARY_FILE = path.join(__dirname, 'salary.json');

// ===== DEFAULT DATA =====
const defaultMenu = [
  { id: 1, name: 'Bariis', price: 1.1, icon: '🍚', tag: 'bariis' },
  { id: 2, name: 'Baris saldato', price: 1.50, icon: '🍛', tag: 'saldato' },
  { id: 3, name: 'Baasto', price: 1.1, icon: '🍝', tag: 'baasto' },
  { id: 4, name: 'Baasto saldato', price: 1.50, icon: '🍝', tag: 'saldato' },
  { id: 5, name: 'Haaf suqaar', price: 1.50, icon: '🍗', tag: 'suqaar' },
  { id: 6, name: 'Saxan suqaar', price: 3, icon: '🍽️', tag: 'saxan' },
  { id: 7, name: 'Chicken Broosto', price: 1.1, icon: '🍗', tag: 'broosto' },
  { id: 8, name: 'Friends chicken afarxabo', price: 1, icon: '🐔', tag: 'afarxabo' },
  { id: 9, name: 'Shuwarmo', price: 1.50, icon: '🌯', tag: 'shuwarmo' },
  { id: 10, name: 'Chicken burger', price: 2, icon: '🍔', tag: 'burger' },
  { id: 11, name: 'Smoothei', price: 0.75, icon: '🥤', tag: 'smoothie' },
  { id: 12, name: 'Coffee', price: 0.75, icon: '☕', tag: 'coffee' },
  { id: 13, name: 'Shaah', price: 0.25, icon: '🍵', tag: 'shaah' },
  { id: 14, name: 'Faxam', price: 1.5, icon: '🍞', tag: 'faxam' },
  { id: 15, name: 'Shuweeyo', price: 1.5, icon: '🔥', tag: 'shuweeyo' },
  { id: 16, name: 'Sanbuus', price: 0.25, icon: '🥟', tag: 'sanbuus' },
  { id: 17, name: 'Ice cofee', price: 1, icon: '🧊', tag: 'ice coffee' }
];

const defaultExpenses = [
  { id: 1, name: 'Vegetables', category: 'Food', amount: 150, date: '2026-07-10', type: 'deyn' },
  { id: 2, name: 'Meat', category: 'Food', amount: 300, date: '2026-07-09', type: 'cash' },
  { id: 3, name: 'Electricity Bill', category: 'Utilities', amount: 80, date: '2026-07-08', type: 'deyn' }
];

const defaultSalary = [
  { id: 1, name: 'Ahmed Ali', role: 'Cook', salary: 500, hours: 40, bonus: 0 },
  { id: 2, name: 'Fatima Hassan', role: 'Cashier', salary: 300, hours: 35, bonus: 20 },
  { id: 3, name: 'Omar Abdirahman', role: 'Waiter', salary: 250, hours: 30, bonus: 10 }
];

// ===== HELPERS =====
const readData = (file, defaultData) => {
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed.length > 0) return parsed;
    }
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
    return defaultData;
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
    return defaultData;
  }
};

const writeData = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${file}:`, error);
    return false;
  }
};

// ===== ROOT =====
app.get('/', (req, res) => {
  res.json({
    status: 'Server is running',
    message: 'Welcome to Friends Fast Food API',
    endpoints: {
      menu: '/api/menu',
      orders: '/api/orders',
      users: '/api/users',
      expenses: '/api/expenses',
      salary: '/api/salary',
      register: '/api/register (POST)',
      login: '/api/login (POST)'
    }
  });
});

// ===== AUTH =====
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  
  const users = readData(USERS_FILE, []);
  
  if (users.find(user => user.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  
  const newUser = {
    id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
    name,
    email,
    password, // In production, use bcrypt!
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  if (writeData(USERS_FILE, users)) {
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save user' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  
  const users = readData(USERS_FILE, []);
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  
  res.json({
    success: true,
    message: 'Login successful',
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.get('/api/users', (req, res) => {
  const users = readData(USERS_FILE, []);
  res.json(users);
});

// ===== MENU =====
app.get('/api/menu', (req, res) => {
  const menu = readData(MENU_FILE, defaultMenu);
  res.json(menu);
});

app.get('/api/menu/:id', (req, res) => {
  const menu = readData(MENU_FILE, defaultMenu);
  const item = menu.find(m => m.id === parseInt(req.params.id));
  if (item) res.json(item);
  else res.status(404).json({ message: 'Item not found' });
});

app.post('/api/menu', (req, res) => {
  const menu = readData(MENU_FILE, defaultMenu);
  const { name, price, icon } = req.body;
  const newItem = {
    id: menu.length > 0 ? Math.max(...menu.map(i => i.id)) + 1 : 1,
    name,
    price: parseFloat(price),
    icon: icon || '🍽️'
  };
  menu.push(newItem);
  if (writeData(MENU_FILE, menu)) {
    res.status(201).json(newItem);
  } else {
    res.status(500).json({ message: 'Failed to save item' });
  }
});

app.delete('/api/menu/:id', (req, res) => {
  const menu = readData(MENU_FILE, defaultMenu);
  const id = parseInt(req.params.id);
  const filtered = menu.filter(i => i.id !== id);
  if (filtered.length === menu.length) {
    return res.status(404).json({ message: 'Item not found' });
  }
  if (writeData(MENU_FILE, filtered)) {
    res.json({ message: 'Item deleted' });
  } else {
    res.status(500).json({ message: 'Failed to delete' });
  }
});

// ===== ORDERS =====
app.get('/api/orders', (req, res) => {
  const orders = readData(ORDERS_FILE, []);
  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const orders = readData(ORDERS_FILE, []);
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (order) res.json(order);
  else res.status(404).json({ message: 'Order not found' });
});

app.post('/api/orders', (req, res) => {
  const orders = readData(ORDERS_FILE, []);
  const { items, total } = req.body;
  const newOrder = {
    id: orders.length > 0 ? orders[orders.length - 1].id + 1 : 1,
    items,
    total,
    date: new Date().toISOString(),
    status: 'pending'
  };
  orders.push(newOrder);
  if (writeData(ORDERS_FILE, orders)) {
    res.status(201).json(newOrder);
  } else {
    res.status(500).json({ message: 'Failed to save order' });
  }
});

app.put('/api/orders/:id', (req, res) => {
  const orders = readData(ORDERS_FILE, []);
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return res.status(404).json({ message: 'Order not found' });
  orders[index].status = status;
  if (writeData(ORDERS_FILE, orders)) res.json(orders[index]);
  else res.status(500).json({ message: 'Failed to update' });
});

app.delete('/api/orders/:id', (req, res) => {
  const orders = readData(ORDERS_FILE, []);
  const id = parseInt(req.params.id);
  const filtered = orders.filter(o => o.id !== id);
  if (filtered.length === orders.length) {
    return res.status(404).json({ message: 'Order not found' });
  }
  if (writeData(ORDERS_FILE, filtered)) res.json({ message: 'Order deleted' });
  else res.status(500).json({ message: 'Failed to delete' });
});

// ===== EXPENSES =====
app.get('/api/expenses', (req, res) => {
  const expenses = readData(EXPENSES_FILE, defaultExpenses);
  res.json(expenses);
});

app.post('/api/expenses', (req, res) => {
  const expenses = readData(EXPENSES_FILE, defaultExpenses);
  const { name, category, amount, date, type } = req.body;
  const newExpense = {
    id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
    name,
    category: category || 'Food',
    amount: parseFloat(amount),
    date: date || new Date().toISOString().split('T')[0],
    type: type || 'cash'
  };
  expenses.push(newExpense);
  if (writeData(EXPENSES_FILE, expenses)) {
    res.status(201).json(newExpense);
  } else {
    res.status(500).json({ message: 'Failed to save expense' });
  }
});

app.delete('/api/expenses/:id', (req, res) => {
  const expenses = readData(EXPENSES_FILE, defaultExpenses);
  const id = parseInt(req.params.id);
  const filtered = expenses.filter(e => e.id !== id);
  if (filtered.length === expenses.length) {
    return res.status(404).json({ message: 'Expense not found' });
  }
  if (writeData(EXPENSES_FILE, filtered)) {
    res.json({ message: 'Expense deleted' });
  } else {
    res.status(500).json({ message: 'Failed to delete' });
  }
});

// ===== SALARY =====
app.get('/api/salary', (req, res) => {
  const salary = readData(SALARY_FILE, defaultSalary);
  res.json(salary);
});

app.post('/api/salary', (req, res) => {
  const salary = readData(SALARY_FILE, defaultSalary);
  const { name, role, salary: monthlySalary, hours, bonus } = req.body;
  const newEmployee = {
    id: salary.length > 0 ? Math.max(...salary.map(e => e.id)) + 1 : 1,
    name,
    role: role || 'Staff',
    salary: parseFloat(monthlySalary) || 0,
    hours: parseFloat(hours) || 0,
    bonus: parseFloat(bonus) || 0
  };
  salary.push(newEmployee);
  if (writeData(SALARY_FILE, salary)) {
    res.status(201).json(newEmployee);
  } else {
    res.status(500).json({ message: 'Failed to save employee' });
  }
});

app.delete('/api/salary/:id', (req, res) => {
  const salary = readData(SALARY_FILE, defaultSalary);
  const id = parseInt(req.params.id);
  const filtered = salary.filter(e => e.id !== id);
  if (filtered.length === salary.length) {
    return res.status(404).json({ message: 'Employee not found' });
  }
  if (writeData(SALARY_FILE, filtered)) {
    res.json({ message: 'Employee deleted' });
  } else {
    res.status(500).json({ message: 'Failed to delete' });
  }
});

// ===== START SERVER =====
app.listen(port, '0.0.0.0', () => {
  console.log(`🍽️ Server running at http://localhost:${port}`);
  console.log(`📋 Menu: http://localhost:${port}/api/menu`);
  console.log(`📦 Orders: http://localhost:${port}/api/orders`);
  console.log(`👤 Users: http://localhost:${port}/api/users`);
  console.log(`💰 Expenses: http://localhost:${port}/api/expenses`);
  console.log(`💼 Salary: http://localhost:${port}/api/salary`);
});
