const db = require('../db/dbInstance');

function getAll(req, res) {
    const query = 'SELECT * FROM users';
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
}
module.exports = getAll
