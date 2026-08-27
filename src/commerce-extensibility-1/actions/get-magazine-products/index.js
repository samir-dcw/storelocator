import { Core } from '@adobe/aio-sdk';
import { getStateClient, readThroughCache, normalizePrefix } from '../_shared/store.js';

const { log } = Core;

function json(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

export async function main(params) {
  const logger = log;
  try {
    const prefix = normalizePrefix(params.IO_STATE_KEY || 'magazine');
    const skus = Array.isArray(params.skus) ? params.skus : String(params.skus || '').split(',').filter(Boolean);
    if (!skus.length) return json(400, { error: 'skus are required' });
    const state = await getStateClient(logger);
    const products = await readThroughCache({
      stateClient: state,
      key: `${prefix}:products:${skus.join(',')}`,
      loader: async () => skus.map((sku) => ({ sku, name: sku, price: null, status: 'unknown' })),
    });
    return json(200, { products });
  } catch (error) {
    logger.error('get-magazine-products failed', { message: error.message });
    return json(500, { error: 'Failed to load magazine products' });
  }
}
