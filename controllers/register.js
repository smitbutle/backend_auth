const fs = require('fs');
const path = require('path');
const NodeRSA = require('node-rsa');
const { hm1, hm2, hm3, hm4, hm5, hm6, hm7, hm8 } = require('./constants');
const db = require('../db/dbInstance');

// Load private key for decryption
const privateKeyPath = path.join(__dirname, '../private.pem');
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const rsaKey = new NodeRSA(privateKey);

function register(req, res) {
  try {
    const { username, email, embedding: encryptedEmbedding, hash } = req.body;
    console.log('REGISTER REQUEST:', { username, email });

    // Decrypt embedding
    let decryptedEmbedding;
    try {
      decryptedEmbedding = JSON.parse(rsaKey.decrypt(encryptedEmbedding, 'utf8'));
    } catch (decryptError) {
      console.error('Decryption failed:', decryptError);
      return res.status(400).send('Invalid encrypted embedding');
    }

    console.log('DECRYPTED EMBEDDING:', decryptedEmbedding);

    // Validate hash values
    const { m1, m2, m3, m4, m5, w1, w2, w3 } = hash;
    if (m1 !== hm1 || m2 !== hm2 || m3 !== hm3 || m4 !== hm4 || m5 !== hm5 || w1 !== hm6 || w2 !== hm7 || w3 !== hm8) {
      console.log('Hash mismatch');
      return res.status(402).send('Hash mismatch');
    }
    console.log('Hashes matched');

    // Insert user into database
    const query = `INSERT INTO users (username, email, embedding) VALUES (?, ?, ?)`;
    const values = [username, email, JSON.stringify(decryptedEmbedding)];

    db.run(query, values, (err) => {
      if (err) {
        if (err.errno === 19) { // UNIQUE constraint violation
          console.log('Username already exists:', username);
          return res.status(401).send('Username already exists');
        }
        console.error('Error saving user:', err);
        return res.status(500).send('Error saving user.');
      }
      console.log('REGISTRATION SUCCESS:', username);
      res.status(200).send('User registered successfully.');
    });
  } catch (error) {
    console.error('Unexpected error in registration:', error);
    res.status(500).send('Server error.');
  }
}

module.exports = register;
