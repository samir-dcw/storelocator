import { Core } from '@adobe/aio-sdk';
import { getCollectionName, getDbClient } from '../_shared/store.js';

const { log } = Core;

function json(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

export async function main(params) {
  const logger = log;
  try {
    const payload = typeof params.body === 'string' ? JSON.parse(params.body) : (params.body || params);
    const ids = Array.isArray(payload.ids) ? payload.ids : [];
    if (!ids.length || !['enable', 'disable'].includes(payload.mode)) {
      return json(400, { error: 'ids and mode are required' });
    }
    const db = await getDbClient(logger);
    const collection = await db.collection(getCollectionName('articles'));
    await Promise.all(ids.map((id) => collection.updateOne({ id }, { $set: { enabled: payload.mode === 'enable', updatedAt: new Date().toISOString() } })));
    return json(200, { updated: ids.length, mode: payload.mode });
  } catch (error) {
    logger.error('bulk-toggle-articles failed', { message: error.message });
    return json(500, { error: 'Failed to update articles' });
  }
}
