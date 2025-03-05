const fs = require('fs');
const path = require('path');

function getPubKey(req, res) {
    try {
        const publicKeyPath = path.join(__dirname, '../keys/public.pem'); // Adjust the path if needed
        const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

        res.json({ publicKey }); // ✅ Send public key as JSON
    } catch (error) {
        console.error("Error reading public key:", error);
        res.status(500).send("Error retrieving public key");
    }
}

module.exports = getPubKey;
