import { Core } from '@adobe/aio-sdk';
import { getCollectionName, getDbClient, getStateClient, invalidateKeys, normalizePrefix } from '../_shared/store.js';
import { normalizeArticle, buildArticleCacheKeys } from '../_shared/magazine.js';

const { log } = Core;

function json(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

export async function main(params) {
  const logger = log;
  try {
    const payload = typeof params.body === 'string' ? JSON.parse(params.body) : (params.body || params);
    const article = normalizeArticle(payload);
    if (!article.id) return json(400, { error: 'id is required' });
    const db = await getDbClient(logger);
    const state = await getStateClient(logger);
    const collection = await db.collection(getCollectionName('articles'));
    await collection.updateOne({ id: article.id }, { $set: article }, { upsert: true });
    await invalidateKeys(state, buildArticleCacheKeys(normalizePrefix(params.IO_STATE_KEY || payload.IO_STATE_KEY || 'magazine'), article.id));
    return json(200, { article });
  } catch (error) {
    logger.error('update-article failed', { message: error.message });
    return json(500, { error: 'Failed to update article' });
  }
}
