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
    if (!article.title || !article.slug) return json(400, { error: 'title and slug are required' });
    const db = await getDbClient(logger);
    const state = await getStateClient(logger);
    const collection = await db.collection(getCollectionName('articles'));
    await collection.insertOne(article);
    await invalidateKeys(state, buildArticleCacheKeys(normalizePrefix(params.IO_STATE_KEY || payload.IO_STATE_KEY || 'magazine'), article.id));
    return json(201, { article });
  } catch (error) {
    logger.error('create-article failed', { message: error.message });
    return json(error.message === 'Unauthorized' ? 401 : 500, { error: error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to create article' });
  }
}
