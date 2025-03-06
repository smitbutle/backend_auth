const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { register, startTest, submitAttempt, getReport, verify, getAll, getPubKey} = require('./controllers');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: '*',  // Allow requests from any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Routes
app.post('/register', register);
app.post('/starttest', startTest);
app.post('/submitattempt', submitAttempt);
app.post('/getreport', getReport);
app.post('/verify', verify);

// Get 
// app.get('/api/data', getAll);
app.get('/getpubkey', getPubKey);
app.get('/', (req,res) => {res.send('server is running')})

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
