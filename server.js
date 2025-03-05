const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { register, startTest, submitAttempt, getReport, verify, getAll, getPubKey} = require('./controllers');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Load public key for encryption
const publicKeyPath = path.join(__dirname, 'public.pem');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

// Routes
app.post('/register', register);
app.post('/starttest', startTest);
app.post('/submitattempt', submitAttempt);
app.post('/getreport', getReport);
app.post('/verify', verify);

// Get all data from the database for testing purposes
app.get('/api/data', getAll);

// Get public key for encryption
app.get('/getPubKey', getPubKey);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
