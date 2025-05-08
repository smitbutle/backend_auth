function cosineSimilarity(embedding1, embedding2) {
  // Convert embeddings if they are objects
  if (typeof embedding1 === 'object' && !Array.isArray(embedding1)) {
    embedding1 = Object.values(embedding1);
  }
  if (typeof embedding2 === 'object' && !Array.isArray(embedding2)) {
    embedding2 = Object.values(embedding2);
  }

  // Check if embeddings are arrays and have the same length
  if (!Array.isArray(embedding1) || !Array.isArray(embedding2) || embedding1.length !== embedding2.length) {
    throw new TypeError("Embeddings must be arrays of the same length.");
  }

  // Calculate dot product
  const dotProduct = embedding1.reduce((sum, value, i) => sum + value * embedding2[i], 0);

  // Calculate magnitudes
  const magnitude1 = Math.sqrt(embedding1.reduce((sum, value) => sum + value * value, 0));
  const magnitude2 = Math.sqrt(embedding2.reduce((sum, value) => sum + value * value, 0));

  // Calculate cosine similarity
  return dotProduct / (magnitude1 * magnitude2);
}

module.exports = { cosineSimilarity };



