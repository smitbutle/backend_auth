const THRESHOLD = 0.8;
const db = require('../db/dbInstance');


 function getReport(req, res){
    const { username, test_id } = req.body;
  
    db.get(`SELECT user_id FROM users WHERE username = ?`, [username], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: "User not found" });
  
      db.all(
        `SELECT a.score, a.timestamp, t.test_name 
         FROM attempts a 
         JOIN tests t ON a.test_id = t.test_id
         WHERE t.test_id = ? AND t.user_id = ?
         ORDER BY a.timestamp`,
        [test_id, user.user_id],
        (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          if (rows.length === 0) return res.status(404).json({ error: "No data found for this test." });
  
          // Filter out null scores for calculations
          const validScores = rows
            .filter(row => row.score !== null && row.score !== -1)
            .map(row => row.score);
          
          // Calculate average and median only for valid scores
          const averageScore = validScores.length > 0 
            ? validScores.reduce((a, b) => a + b, 0) / validScores.length 
            : null;
          
          const sortedScores = validScores.sort((a, b) => a - b);
          const medianScore = validScores.length > 0 
            ? sortedScores[Math.floor(validScores.length / 2)] 
            : null;
  
          // Construct report
          const report = {
            username,
            test_id,
            test_name: rows[0].test_name,
            details: rows.map(row => ({
              score: row.score === -1? null : row.score,
              timestamp: row.timestamp,
              status: row.score === -1 ? "Multiple face detected" : (row.score !== null ? (row.score > THRESHOLD ? "Pass" : "Fail") : "Not Attempted")
            })),
            summary: {
              average_score: averageScore,
              median_score: medianScore,
              total_attempts: rows.length
            }
          };
  
          res.json(report);
        }
      );
    });
  }

  module.exports =  getReport