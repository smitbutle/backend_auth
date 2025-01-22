const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const cors = require('cors');

const { register, startTest, submitAttempt, getReport, verify, getAll } = require('./controllers');

const PORT = 5000;
// Middleware
app.use(cors());
app.use(bodyParser.json());

app.post('/register', register);
app.post('/starttest', startTest );
app.post('/submitattempt',submitAttempt);
app.post('/getreport',getReport);
app.post('/verify', verify); // Verification route

// Get all data from the database for testing purposes
app.get('/api/data', getAll);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});