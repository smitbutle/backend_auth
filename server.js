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

// Get all data from the database for testing purposes
app.get('/api/data', getAll);

// Get public key for encryption
app.get('/getpubkey', (req, res) => {
  try {
    const publicKeyPath = path.join(__dirname, './public_key.txt');
    const publicKey = fs.readFileSync(publicKeyPath, 'utf8').trim();
    
    res.status(200).json({ publicKey });
  } catch (error) {
    console.error("Error fetching public key:", error);
    res.status(500).send("Error retrieving public key.");
  }
});


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
