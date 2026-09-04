import { resolveActionParams } from '../utils/business-config-loader.js';
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

  // Web actions often merge JSON body fields directly onto params.
  return params;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

export async function main(params) {
  const logger = createLogger({ action: 'admin-store-api', requestId: params.requestId });
  try {
    const runtimeParams = await resolveActionParams(params, logger);
    const input = parseInput(runtimeParams);
    const repo = createStoreRepository(runtimeParams, logger);
    const method = (params.__ow_method || input.method || 'get').toLowerCase();

    if (method === 'get') {
      const items = await repo.getAll();
      return json(200, { items });
    }

    if (method === 'post') {
      if (!input.id || !input.name) {
        return json(400, { error: 'id and name are required' });
      }
      const saved = await repo.upsert(normalizeStore({ ...input, amenities: asArray(input.amenities) }));
      return json(201, { saved });
    }

    if (method === 'put' || method === 'patch') {
      if (!input.id) {
        return json(400, { error: 'id is required' });
      }
      const existing = await repo.getById(input.id);
      if (!existing) {
        return json(404, { error: 'Store not found' });
      }
      const saved = await repo.upsert(normalizeStore({ ...existing, ...input, amenities: asArray(input.amenities) }));
      return json(200, { saved });
    }

    if (method === 'delete') {
      if (!input.id) {
        return json(400, { error: 'id is required' });
      }
      const removed = await repo.remove(input.id);
      return removed ? json(200, { removed: true }) : json(404, { removed: false, error: 'Store not found' });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (error) {
    logger.error('admin-store-api.failed', { error: error.message, stack: error.stack });
    return json(500, { error: 'Unable to process store API request' });
  }
}
