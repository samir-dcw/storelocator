import { createLogger } from '../utils/logger.js';
import { createIOStateClient } from '../utils/io-state-client.js';
import { createCommerceGraphQLClient } from '../utils/commerce-graphql-client.js';
import { guardStoreLocatorEnabled } from '../utils/config.js';

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export async function main(params) {
  const logger = createLogger({ action: 'check-stock', requestId: params.requestId });
  try {
    if (!guardStoreLocatorEnabled(params)) {
      return json(200, { enabled: false, stock: null });
    }

    const input = params.query || params.body || {};
    const sku = input.sku || input.product_id;
    const sourceCode = input.source_code;
    if (!sku || !sourceCode) {
      return json(400, { error: 'sku/product_id and source_code are required' });
    }

    const cache = createIOStateClient(params, logger);
    const cacheKey = `stock:${sku}:${sourceCode}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return json(200, { source_code: sourceCode, sku, stock: cached, cached: true, enabled: true });
    }

    const commerce = createCommerceGraphQLClient(params, logger);
    const item = await commerce.fetchStockBySource(sku, sourceCode);
    const sourceItem = item?.source_items?.[0] || null;
    const stock = {
      sku,
      source_code: sourceCode,
      in_stock: Boolean(sourceItem?.status),
      quantity: Number(sourceItem?.quantity || 0),
    };

    await cache.put(cacheKey, stock, 120);
    return json(200, { source_code: sourceCode, sku, stock, cached: false, enabled: true });
  } catch (error) {
    logger.error('check-stock.failed', { error: error.message });
    return json(500, { error: 'Unable to check stock' });
  }
}
