import { createLogger } from '../utils/logger.js';
import { createStoreRepository, normalizeStore } from '../utils/store-repository.js';

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function parseInput(params) {
  const raw = params.body ?? params.query ?? params.data;

  if (typeof raw === 'string' && raw.trim()) {
    try {
      return JSON.parse(raw);
    } catch {
      // Fall through to params when the body is not valid JSON.
    }
  }

  if (raw && typeof raw === 'object' && Object.keys(raw).length > 0) {
    return raw;
  }

  return params;
}

function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

function toStoreInput(input) {
  return normalizeStore({
    id: input.id,
    name: input.name,
    source_code: input.source_code || input.sourceCode,
    latitude: input.latitude ?? input.lat,
    longitude: input.longitude ?? input.lng,
    address: input.address,
    hours: input.hours,
    phone: input.phone,
    amenities: asArray(input.amenities),
    enabled: input.enabled,
  });
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
      const saved = await repo.upsert(toStoreInput(input));
      return json(200, { saved });
    }

    if (method === 'put' || method === 'patch') {
      if (!input.id) {
        return json(400, { error: 'id is required' });
      }
      const existing = await repo.getById(input.id);
      if (!existing) {
        return json(404, { error: 'Store not found' });
      }
      const saved = await repo.upsert({ ...existing, ...input, amenities: asArray(input.amenities) });
      return json(200, { saved });
    }

    if (method === 'delete') {
      if (!input.id) {
        return json(400, { error: 'id is required' });
      }
      const removed = await repo.remove(String(input.id));
      return removed ? json(200, { removed: true }) : json(404, { removed: false, error: 'Store not found' });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (error) {
    logger.error('manage-store-locations.failed', { error: error.message });
    return json(500, { error: 'Unable to manage store locations' });
  }
}
