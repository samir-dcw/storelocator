import { Core } from '@adobe/aio-sdk';
import { getStateClient, invalidateKeys, normalizePrefix } from '../_shared/store.js';

const { log } = Core;

function json(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

export async function main(params) {
  const logger = log;
  try {
    const payload = typeof params.body === 'string' ? JSON.parse(params.body) : (params.body || params);
    const updatedAt = payload.updated_at || payload.updatedAt;
    if (!payload.sku) {
      return json(400, { error: 'sku is required' });
    }
    const prefix = normalizePrefix(params.IO_STATE_KEY || payload.IO_STATE_KEY || 'magazine');
    const state = await getStateClient(logger);
    const key = `${prefix}:products:${payload.sku}`;
    const previous = await state.get(key);
    if (previous?.value?.updatedAt && updatedAt && new Date(previous.value.updatedAt) >= new Date(updatedAt)) {
      return json(200, { invalidated: false, reason: 'stale-event' });
    }
    await invalidateKeys(state, [key], logger);
    await state.put(key, { sku: payload.sku, updatedAt: updatedAt || new Date().toISOString() }, { ttl: 60 });
    return json(200, { invalidated: true, sku: payload.sku });
  } catch (error) {
    logger.error('cache-invalidate-on-product-save failed', { message: error.message });
    return json(500, { error: 'Failed to invalidate product cache' });
  }
}
