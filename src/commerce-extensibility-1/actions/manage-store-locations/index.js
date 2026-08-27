import { createLogger } from '../utils/logger.js';
import { createStoreRepository } from '../utils/store-repository.js';

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function parseInput(params) {
  return params.body || params.query || params.data || {};
}

function normalizeStoreInput(input) {
  return {
    id: String(input.id),
    name: String(input.name),
    source_code: input.source_code || input.sourceCode || String(input.id),
    latitude: input.latitude ?? input.lat ?? null,
    longitude: input.longitude ?? input.lng ?? null,
    address: input.address || '',
    hours: input.hours || '',
    phone: input.phone || '',
    amenities: Array.isArray(input.amenities) ? input.amenities : [],
    enabled: input.enabled !== false,
  };
}

export async function main(params) {
  const logger = createLogger({ action: 'manage-store-locations', requestId: params.requestId });
  try {
    const input = parseInput(params);
    const repo = createStoreRepository(params, logger);
    const method = (params.__ow_method || input.method || 'get').toLowerCase();

    if (method === 'get') {
      const items = await repo.getAll();
      return json(200, { items });
    }

    if (method === 'post') {
      if (!input.id || !input.name) {
        return json(400, { error: 'id and name are required' });
      }
      const saved = await repo.upsert(normalizeStoreInput(input));
      return json(200, { saved });
    }

    if (method === 'delete') {
      if (!input.id) {
        return json(400, { error: 'id is required' });
      }
      const removed = await repo.remove(String(input.id));
      return json(200, { removed });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (error) {
    logger.error('manage-store-locations.failed', { error: error.message });
    return json(500, { error: 'Unable to manage store locations' });
  }
}
