const db = require('../db/dbInstance');
const cosineSimilarity = require('../utils/similarity');
const THRESHOLD = 0.95;

function verify(req, res){
    const { username, currentEmbedding } = req.body; 
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
  
        const distance = cosineSimilarity(currentEmbedding, savedEmbedding);
        const isVerified = distance > THRESHOLD;
  
        console.log('Username:', username);
        console.log('Distance:', distance);
        console.log('Is verified:', isVerified);
        res.status(200).json({ isVerified });
      } else {
        res.status(404).send('User not found.');
      }
    });
  }

  module.exports = verify