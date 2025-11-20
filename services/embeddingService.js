// services/embeddingService.js
import { pipeline } from '@xenova/transformers';

let embedder = null;

/**
 * Initialize the embedding pipeline (lazy loading)
 */
async function getEmbedder() {
  if (!embedder) {
    console.log('Loading embedding model... (this may take a moment on first run)');
    embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
    console.log('Embedding model loaded successfully!');
  }
  return embedder;
}

/**
 * Generate embeddings locally using Transformers.js
 * No API key needed!
 */
export async function generateEmbedding(text) {
  try {
    const extractor = await getEmbedder();
    
    const output = await extractor(text, {
      pooling: 'mean',
      normalize: true
    });

    // Convert tensor to array
    const embedding = Array.from(output.data);
    
    if (embedding.length !== 384) {
      throw new Error(`Expected 384 dimensions, got ${embedding.length}`);
    }
    
    return embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw error;
  }
}

export async function vectorSearch(AiContentModel, queryEmbedding, userId, limit = 5) {
  try {
    const results = await AiContentModel.aggregate([
      {
        $vectorSearch: {
          index: "project-o-vector-index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: limit,
          filter: { userId: userId }
        }
      },
      {
        $project: {
          _id: 1,
          prompt: 1,
          output: 1,
          type: 1,
          userId: 1,
          createdAt: 1,
          score: { $meta: "vectorSearchScore" }
        }
      },
      {
        $match: { score: { $gte: 0.7 } }
      }
    ]);

    return results;
  } catch (error) {
    console.error('Vector search error:', error);
    throw error;
  }
}