import { createLogger } from '../utils/logger.js';
import { createIOStateClient } from '../utils/io-state-client.js';

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export async function main(params) {
  const logger = createLogger({ action: 'invalidate-stock-cache', requestId: params.requestId });
  try {
    const event = params.event || params.body || params;
    const productId = event.product_id || event.productId;
    const websiteId = event.website_id || event.websiteId;
    if (!productId || !websiteId) {
      return json(400, { error: 'product_id and website_id are required' });
    }

    const state = createIOStateClient(params, logger);
    const cacheKey = `stock:${productId}:${websiteId}`;
    const processedKey = `processed:${cacheKey}:${event.event_id || event.id || 'unknown'}`;
    if (await state.get(processedKey)) {
      return json(200, { skipped: true });
    }

    await state.delete(cacheKey);
    await state.put(processedKey, true, 86400);
    return json(200, { invalidated: true, cacheKey });
  } catch (error) {
    logger.error('invalidate-stock-cache.failed', { error: error.message });
    return json(500, { error: 'Unable to invalidate stock cache' });
  }
}
