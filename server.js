const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Faylka orders-ka
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Akhri orders-ka faylka
const readOrders = () => {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading orders:', error);
    return [];
  }
};

// Kaydi orders-ka faylka
const writeOrders = (orders) => {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing orders:', error);
    return false;
  }
};

// Menu data
const menu = [
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

// ===== API Endpoints =====

// Get all menu items
app.get('/api/menu', (req, res) => {
  res.json(menu);
});

// Get single menu item
app.get('/api/menu/:id', (req, res) => {
  const item = menu.find(m => m.id === parseInt(req.params.id));
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
});

// Get all orders
app.get('/api/orders', (req, res) => {
  const orders = readOrders();
  res.json(orders);
});

// Get single order
app.get('/api/orders/:id', (req, res) => {
  const orders = readOrders();
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

// Create new order
app.post('/api/orders', (req, res) => {
  const orders = readOrders();
  const { items, total } = req.body;
  
  const newOrder = {
    id: orders.length > 0 ? orders[orders.length - 1].id + 1 : 1,
    items: items,
    total: total,
    date: new Date().toISOString(),
    status: 'pending'
  };
  
  orders.push(newOrder);
  
  if (writeOrders(orders)) {
    res.status(201).json(newOrder);
  } else {
    res.status(500).json({ message: 'Failed to save order' });
  }
});

// Update order status
app.put('/api/orders/:id', (req, res) => {
  const orders = readOrders();
  const orderId = parseInt(req.params.id);
  const { status } = req.body;
  
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  orders[orderIndex].status = status;
  
  if (writeOrders(orders)) {
    res.json(orders[orderIndex]);
  } else {
    res.status(500).json({ message: 'Failed to update order' });
  }
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
  const orders = readOrders();
  const orderId = parseInt(req.params.id);
  
  const filteredOrders = orders.filter(o => o.id !== orderId);
  if (filteredOrders.length === orders.length) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  if (writeOrders(filteredOrders)) {
    res.json({ message: 'Order deleted successfully' });
  } else {
    res.status(500).json({ message: 'Failed to delete order' });
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🍽️ Server running at http://localhost:${port}`);
  console.log(`📋 Menu available at http://localhost:${port}/api/menu`);
  console.log(`📦 Orders available at http://localhost:${port}/api/orders`);
  console.log(`💾 Orders saved to: ${ORDERS_FILE}`);
});
