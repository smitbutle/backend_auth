const db = require('../db/dbInstance');


 function startTest(req, res){
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
}
module.exports = startTest