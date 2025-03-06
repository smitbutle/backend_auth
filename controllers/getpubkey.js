const fs = require('fs');
const path = require('path');

const getPubKey = (req, res) => {
  try {
    const publicKeyPath = path.join(__dirname, '../public_key.txt');
    const publicKey = fs.readFileSync(publicKeyPath, 'utf8').trim();
    
    res.status(200).json({ publicKey });
  } catch (error) {
    console.error("Error fetching public key:", error);
    res.status(500).send("Error retrieving public key.");
  }
};

module.exports = { getPubKey };
