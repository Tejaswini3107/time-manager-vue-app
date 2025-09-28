const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data storage (for development)
let clocks = [
  {
    id: 1,
    user_id: 1,
    status: false,
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

let workingTimes = [
  {
    id: 1,
    user_id: 1,
    start: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    end: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  }
];

let users = [
  {
    id: 1,
    name: 'User',
    email: 'user@example.com',
    created_at: new Date().toISOString()
  }
];

// Helper function to get next ID
const getNextId = (array) => Math.max(...array.map(item => item.id), 0) + 1;

// CLOCK ENDPOINTS
app.get('/api/clocks', (req, res) => {
  const { user_id } = req.query;
  let filteredClocks = clocks;
  
  if (user_id) {
    filteredClocks = clocks.filter(clock => clock.user_id == user_id);
  }
  
  res.json(filteredClocks);
});

app.post('/api/clocks', (req, res) => {
  const newClock = {
    id: getNextId(clocks),
    user_id: req.body.user_id || 1,
    status: req.body.status,
    time: req.body.time || new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  
  clocks.push(newClock);
  res.status(201).json(newClock);
});

app.get('/api/clocks/:id', (req, res) => {
  const clock = clocks.find(c => c.id == req.params.id);
  if (!clock) {
    return res.status(404).json({ error: 'Clock not found' });
  }
  res.json(clock);
});

// WORKING TIMES ENDPOINTS
app.get('/api/workingtimes', (req, res) => {
  const { user_id, start, end } = req.query;
  let filteredWorkingTimes = workingTimes;
  
  if (user_id) {
    filteredWorkingTimes = workingTimes.filter(wt => wt.user_id == user_id);
  }
  
  res.json(filteredWorkingTimes);
});

app.post('/api/workingtimes', (req, res) => {
  const newWorkingTime = {
    id: getNextId(workingTimes),
    user_id: req.body.user_id || 1,
    start: req.body.start,
    end: req.body.end,
    created_at: new Date().toISOString()
  };
  
  workingTimes.push(newWorkingTime);
  res.status(201).json(newWorkingTime);
});

app.get('/api/workingtimes/:id', (req, res) => {
  const workingTime = workingTimes.find(wt => wt.id == req.params.id);
  if (!workingTime) {
    return res.status(404).json({ error: 'Working time not found' });
  }
  res.json(workingTime);
});

app.put('/api/workingtimes/:id', (req, res) => {
  const index = workingTimes.findIndex(wt => wt.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Working time not found' });
  }
  
  workingTimes[index] = { ...workingTimes[index], ...req.body };
  res.json(workingTimes[index]);
});

app.delete('/api/workingtimes/:id', (req, res) => {
  const index = workingTimes.findIndex(wt => wt.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Working time not found' });
  }
  
  workingTimes.splice(index, 1);
  res.status(204).send();
});

// USER ENDPOINTS
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.post('/api/users', (req, res) => {
  const newUser = {
    id: getNextId(users),
    name: req.body.name,
    email: req.body.email,
    created_at: new Date().toISOString()
  };
  
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users[index] = { ...users[index], ...req.body };
  res.json(users[index]);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Time Manager API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Time Manager API Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});
