const db = require('../db/dbInstance');

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
  
 
 function submitAttempt(req, res){
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
    let i =0;
    const results = embeddingsArray.map((embedding) => {
      try {
        let score = null;
        // Check if embedding is not null, then calculate the score
        if (embedding !== null) {
          if (embedding === "X") {
            score = -1;
          }
          else score = calculateEuclideanDistance(referenceEmbedding, embedding);
        }
        
        // Insert into database, with score being null if embedding is null
        let timestamp = timeStapArray[i];
        db.run(
          `INSERT INTO attempts (test_id, embedding, score, timestamp) VALUES (?, ?, ?, ?)`,
          [test_id, JSON.stringify(embedding), score, timestamp],
        );
        
        i++;
        return { embedding, score , timestamp};
      } catch (error) {
        console.error("Error calculating distance:", error);
        return { embedding, error: error.message };
      }
    });

    res.json({ success: true, results });
  });
}

module.exports = submitAttempt