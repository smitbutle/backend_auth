const fs = require('fs');
const path = require('path');
const { decryptData } = require('../utils/decryption'); // Assuming decryptData is implemented in utils/decryption.js
const { hm1, hm2, hm3, hm4, hm5, hm6, hm7, hm8 } = require('./constants');
const db = require('../db/dbInstance');

// Load private key for ECC decryption
const privateKeyPath = path.join(__dirname, '../private_key.txt'); // Ensure this is the correct path
const privateKeyHex = fs.readFileSync(privateKeyPath, 'utf8').trim();

function register(req, res) {
  try {
    const { username, email, encrypted_aes_key, iv, embedding: encryptedEmbedding, hash } = req.body;
    console.log('REGISTER REQUEST:', { username, email });

    if (!encrypted_aes_key || !iv || !encryptedEmbedding) {
      return res.status(400).send('Missing encryption parameters.');
    }

    // Decrypt embedding using ECC and AES-GCM
    let decryptedEmbedding;
    try {
      decryptedEmbedding = decryptData(encrypted_aes_key, iv, encryptedEmbedding, privateKeyHex);
      if (!Array.isArray(decryptedEmbedding) || !decryptedEmbedding.every(num => typeof num === 'number')) {
        throw new Error('Invalid decrypted embedding format');
      }
    } catch (decryptError) {
      console.error('Decryption failed:', decryptError);
      return res.status(400).send('Invalid encrypted embedding');
    }

    console.log('DECRYPTED EMBEDDING:', decryptedEmbedding);

    // Validate hash values
    const expectedHashes = [hm1, hm2, hm3, hm4, hm5, hm6, hm7, hm8];
    const receivedHashes = [hash.m1, hash.m2, hash.m3, hash.m4, hash.m5, hash.w1, hash.w2, hash.w3];

    if (!expectedHashes.every((value, index) => value === receivedHashes[index])) {
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
          console.log(`Username "${username}" already exists.`);
          return res.status(401).send('Username already exists');
        }
        console.error('Database error:', err);
        return res.status(500).send('Error saving user.');
      }
      console.log(`REGISTRATION SUCCESS: ${username}`);
      res.status(200).send('User registered successfully.');
    });
  } catch (error) {
    console.error('Unexpected error in registration:', error);
    res.status(500).send('Server error.');
  }
}

module.exports = register;
