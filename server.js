const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const cors = require('cors');
const port = 5000;
const THRESHOLD = 0.35;


// Middleware
app.use(cors());
app.use(bodyParser.json());

// SQLite Database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      embedding TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS tests (
      test_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      test_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS attempts (
      attempt_id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id INTEGER,
      embedding TEXT,
      score REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (test_id) REFERENCES tests(test_id)
    )`);
  }
});
function objectToArray(embeddingObject) {
  return Object.keys(embeddingObject)
    .sort((a, b) => parseInt(a) - parseInt(b)) // Ensure keys are in the correct order
    .map(key => embeddingObject[key]);
}

function calculateEuclideanDistance(embedding1, embedding2) {
  // Convert embeddings if they are objects
  if (typeof embedding1 === 'object' && !Array.isArray(embedding1)) {
    embedding1 = objectToArray(embedding1);
  }
  if (typeof embedding2 === 'object' && !Array.isArray(embedding2)) {
    embedding2 = objectToArray(embedding2);
  }

  // Check if embeddings are arrays and have the same length
  if (!Array.isArray(embedding1) || !Array.isArray(embedding2) || embedding1.length !== embedding2.length) {
    throw new TypeError("Embeddings must be arrays of the same length.");
  }

  // Calculate Euclidean distance
  return Math.sqrt(
    embedding1.reduce((sum, value, i) => sum + Math.pow(value - embedding2[i], 2), 0)
  );
}



app.post('/register', (req, res) => {
  const { username, embedding } = req.body;
  db.run(
    `INSERT INTO users (username, embedding) VALUES (?, ?)`, 
    [username, JSON.stringify(embedding)], 
    (err) => {
      if (err) {
        if (err.errno === 19) { // UNIQUE constraint violation
          res.status(400).send('Username already exists.');
        } else {
          console.error('Error saving user:', err);
          res.status(500).send('Error saving user.');
        }
      } else {
        res.status(200).send('User registered successfully.');
      }
    }
  );
});


app.post('/starttest', (req, res) => {
  const { username, test_name } = req.body;

  db.get(`SELECT user_id FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "User not found" });

    const userId = row.user_id;

    db.run(
      `INSERT INTO tests (user_id, test_name) VALUES (?, ?)`, 
      [userId, test_name],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Test started successfully', test_id: this.lastID });
      }
    );
  });
});

app.post('/submitattempt', (req, res) => {
  const { username, test_id, embeddingsArray } = req.body;

  db.get(`SELECT embedding FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "User not found" });

    let referenceEmbedding;
    try {
      referenceEmbedding = JSON.parse(row.embedding);
    } catch (parseErr) {
      return res.status(500).json({ error: "Error parsing reference embedding." });
    }

    const results = embeddingsArray.map((embedding) => {
      try {
        const score = calculateEuclideanDistance(referenceEmbedding, embedding);
        db.run(
          `INSERT INTO attempts (test_id, embedding, score) VALUES (?, ?, ?)`,
          [test_id, JSON.stringify(embedding), score]
        );
        return { embedding, score };
      } catch (error) {
        console.error("Error calculating distance:", error);
        return { embedding, error: error.message };
      }
    });

    res.json({ success: true, results });
  });
});



app.post('/getreport', (req, res) => {
  const { username, test_id } = req.body;

  db.get(`SELECT user_id FROM users WHERE username = ?`, [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "User not found" });

    db.all(
      `SELECT a.score, a.timestamp, t.test_name 
       FROM attempts a 
       JOIN tests t ON a.test_id = t.test_id
       WHERE t.test_id = ? AND t.user_id = ?`,
      [test_id, user.user_id],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ error: "No data found for this test." });

        const scores = rows.map(row => row.score);
        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const medianScore = scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)];

        const report = {
          username,
          test_id,
          test_name: rows[0].test_name,
          details: rows.map(row => ({
            score: row.score,
            timestamp: row.timestamp,
            status: row.score < THRESHOLD ? "Pass" : "Fail" // Example threshold for pass/fail
          })),
          summary: {
            average_score: averageScore,
            median_score: medianScore,
            total_attempts: scores.length
          }
        };

        res.json(report);
      }
    );
  });
});




// Define the threshold for verification
// Adjust this value as needed

// Verification route
app.post('/verify', (req, res) => {
  const { username, currentEmbedding } = req.body; // Removed threshold from request
  if (typeof currentEmbedding !== 'object' || currentEmbedding === null) {
    return res.status(400).send('Invalid current embedding.');
  }

  db.get(`SELECT embedding FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) {
      console.error('Error fetching user:', err);
      res.status(500).send('Error fetching user.');
    } else if (row) {
      let savedEmbedding;
      try {
        savedEmbedding = JSON.parse(row.embedding);
        if (typeof savedEmbedding !== 'object' || savedEmbedding === null) {
          throw new Error('Saved embedding is not an object.');
        }
      } catch (parseErr) {
        console.error('Error parsing saved embedding:', parseErr);
        return res.status(500).send('Error processing user data.');
      }

      const distance = euclideanDistance(currentEmbedding, savedEmbedding);
      const isVerified = distance < THRESHOLD;

      console.log('Username:', username);
      console.log('Distance:', distance);
      console.log('Is verified:', isVerified);
      res.status(200).json({ isVerified });
    } else {
      res.status(404).send('User not found.');
    }
  });
});

// Get all data from the database for testing purposes
app.get('/api/data', (req, res) => {
  const query = 'SELECT * FROM users';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});


// Function to calculate Euclidean distance between two objects
function euclideanDistance(a, b) {
  const aValues = Object.values(a);
  const bValues = Object.values(b);
  return Math.sqrt(aValues.reduce((acc, val, i) => acc + (val - bValues[i]) ** 2, 0));
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});