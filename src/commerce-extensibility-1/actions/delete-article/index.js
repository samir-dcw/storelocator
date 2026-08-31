import { Core } from '@adobe/aio-sdk';
import { getCollectionName, getDbClient, getStateClient, invalidateKeys, normalizePrefix } from '../_shared/store.js';
import { buildArticleCacheKeys } from '../_shared/magazine.js';

const { log } = Core;

function json(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

export async function main(params) {
  const logger = log;
  try {
    const payload = typeof params.body === 'string' ? JSON.parse(params.body) : (params.body || params);
    if (!payload.id) return json(400, { error: 'id is required' });
    const db = await getDbClient(logger);
    const state = await getStateClient(logger);
    const collection = await db.collection(getCollectionName('articles'));
    if (payload.mode === 'hard') await collection.deleteOne({ id: payload.id });
    else await collection.updateOne({ id: payload.id }, { $set: { enabled: false, archived: true, updatedAt: new Date().toISOString() } });
    await invalidateKeys(state, buildArticleCacheKeys(normalizePrefix(params.IO_STATE_KEY || payload.IO_STATE_KEY || 'magazine'), payload.id));
    return json(200, { deleted: true, mode: payload.mode === 'hard' ? 'hard' : 'soft' });
  } catch (error) {
    logger.error('delete-article failed', { message: error.message });
    return json(500, { error: 'Failed to delete article' });
  }
}
