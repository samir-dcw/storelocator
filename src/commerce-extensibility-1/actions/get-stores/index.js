import { createLogger } from '../utils/logger.js';
import { createIOStateClient } from '../utils/io-state-client.js';
import { createGeocodeClient } from '../utils/geocode-client.js';
import { haversineDistance, withinRadius } from '../utils/distance.js';
import { guardStoreLocatorEnabled } from '../utils/config.js';

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function parseLocation(input) {
  if (input.lat != null && input.lng != null) {
    return { lat: Number(input.lat), lng: Number(input.lng) };
  }
  return null;
}

export async function main(params) {
  const logger = createLogger({ action: 'get-stores', requestId: params.requestId });
  try {
    if (!guardStoreLocatorEnabled(params)) {
      return json(200, { enabled: false, stores: [] });
    }

    const input = params.query || params.body || {};
    const radius = input.radius ?? 25;
    const unit = input.unit === 'km' ? 'km' : 'mi';
    const origin = parseLocation(input) || (input.zip || input.city || input.address
      ? await createGeocodeClient(params, logger).geocode(input.zip || input.city || input.address)
      : null);

    if (!origin) {
      return json(400, { error: 'Provide lat/lng or zip/city/address' });
    }

    const state = createIOStateClient(params, logger);
    const stores = (await state.get('stores')) || [];
    const ranked = stores
      .map((store) => {
        const coords = store.latitude != null && store.longitude != null
          ? { lat: Number(store.latitude), lng: Number(store.longitude) }
          : null;
        const distance = coords ? Number(haversineDistance(origin, coords, unit).toFixed(2)) : null;
        return { ...store, distance };
      })
      .filter((store) => store.distance == null || withinRadius(store.distance, radius))
      .sort((a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY));

    return json(200, {
      enabled: true,
      origin,
      unit,
      radius: Number(radius),
      stores: ranked,
    });
  } catch (error) {
    logger.error('get-stores.failed', { error: error.message });
    return json(500, { error: 'Unable to get stores' });
  }
}
