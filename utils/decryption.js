const base64 = require('base-64');
const { createDecipheriv } = require('crypto');
const { decrypt } = require('eciesjs');

function decryptData(encryptedAesKey, iv, encryptedEmbedding, privateKeyHex) {
  try {
    // Step 1: Decrypt AES Key using ECC
    const decryptedAesKey = decrypt(Buffer.from(privateKeyHex, 'hex'), Buffer.from(encryptedAesKey, 'base64')).toString();

    // Step 2: Decrypt embedding using AES-GCM
    const aesCipher = createDecipheriv('aes-256-gcm', Buffer.from(decryptedAesKey, 'hex'), Buffer.from(iv, 'base64'));
    const decryptedEmbeddingBytes = Buffer.concat([aesCipher.update(Buffer.from(encryptedEmbedding, 'base64')), aesCipher.final()]);

    // Convert bytes to an array
    return Array.from(decryptedEmbeddingBytes);
  } catch (error) {
    throw new Error(`Decryption error: ${error.message}`);
  }
}

module.exports = { decryptData };
