const fs = require('fs');
const NodeRSA = require('node-rsa');

const key = new NodeRSA({ b: 2048 }); // Generate a 2048-bit RSA key pair

const privateKey = key.exportKey('private');
const publicKey = key.exportKey('public');

// Save Private Key
fs.writeFileSync('private.pem', privateKey, { encoding: 'utf8' });
console.log('Private key saved to private.pem');

// Save Public Key
fs.writeFileSync('public.pem', publicKey, { encoding: 'utf8' });
console.log('Public key saved to public.pem');
