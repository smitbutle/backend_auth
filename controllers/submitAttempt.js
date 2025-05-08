const db = require('../db/dbInstance');
const { cosineSimilarity } = require('../utils/similarity');

function submitAttempt(req, res) {
  const { username, test_id, embeddingsArray, timeStapArray } = req.body;

  db.get(`SELECT embedding FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "User not found" });

    let referenceEmbedding;
    try {
      referenceEmbedding = JSON.parse(row.embedding);
    } catch (parseErr) {
      return res.status(500).json({ error: "Error parsing reference embedding." });
    }

    let i = 0;
    const results = embeddingsArray.map((embedding) => {
      try {
        let score = null;
        // Check if embedding is not null, then calculate the score
        if (embedding !== null) {
          if (embedding === "X") {
            score = -1; // Multiple faces detected
          } else {
            score = cosineSimilarity(referenceEmbedding, embedding);
          }
        }

        // Insert into database
        let timestamp = timeStapArray[i];
        db.run(
          `INSERT INTO attempts (test_id, embedding, score, timestamp) VALUES (?, ?, ?, ?)`,
          [test_id, JSON.stringify(embedding), score, timestamp],
        );

        i++;
        return { embedding, score, timestamp };
      } catch (error) {
        console.error("Error calculating similarity:", error);
        return { embedding, error: error.message };
      }
    });

    res.json({ success: true, results });
  });
}

module.exports = submitAttempt;