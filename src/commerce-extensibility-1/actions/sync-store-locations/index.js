import { createLogger } from '../utils/logger.js';
import { createIOStateClient } from '../utils/io-state-client.js';

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function normalizeStores(stores = []) {
  const valid = [];
  const failures = [];
  for (const store of stores) {
    if (!store || !store.id || !store.name) {
      failures.push({ store, error: 'Missing id or name' });
      continue;
    }
    valid.push({
      id: store.id,
      name: store.name,
      source_code: store.source_code || store.sourceCode || store.id,
      latitude: store.latitude ?? store.lat ?? null,
      longitude: store.longitude ?? store.lng ?? null,
      address: store.address || '',
      hours: store.hours || '',
      phone: store.phone || '',
      amenities: store.amenities || [],
    });
  }
  return { valid, failures };
}

export async function main(params) {
  const logger = createLogger({ action: 'sync-store-locations', requestId: params.requestId });
  try {
    const state = createIOStateClient(params, logger);
    const input = params.query || params.body || {};
    const mode = input.mode || 'cron';
    const apiEndpoint = params.PIM_API_ENDPOINT || process.env.PIM_API_ENDPOINT;
    const apiKey = params.PIM_API_KEY || process.env.PIM_API_KEY;

    let stores = input.stores;
    if (!Array.isArray(stores)) {
      if (!apiEndpoint) {
        return json(400, { error: 'PIM_API_ENDPOINT is required when stores are not provided' });
      }
      const response = await fetch(apiEndpoint, {
        headers: apiKey ? { authorization: `Bearer ${apiKey}` } : {},
      });
      if (!response.ok) {
        throw new Error(`PIM sync failed with ${response.status}`);
      }
      const body = await response.json().catch(() => ({}));
      stores = body.stores || body.items || [];
    }

    const { valid, failures } = normalizeStores(stores);
    await state.put('stores', valid, 3600);
    if (failures.length) {
      await state.appendLog('sync-failures', { mode, failures }, 86400);
    }

    return json(200, { synced: valid.length, failed: failures.length, mode });
  } catch (error) {
    logger.error('sync-store-locations.failed', { error: error.message });
    return json(500, { error: 'Unable to sync store locations' });
  }
}
