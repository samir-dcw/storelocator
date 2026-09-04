import { resolveActionParams } from '../utils/business-config-loader.js';
import { createLogger } from '../utils/logger.js';
import { createStoreRepository } from '../utils/store-repository.js';
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

const INPUT_KEYS = [
  'lat', 'lng', 'zip', 'zipcode', 'zip_code', 'postal_code',
  'city', 'address', 'radius', 'unit', 'location_type', 'locationType', 'location',
  'source_code', 'name', 'business_name',
];

function parseRequestBody(params = {}) {
  const raw = params.body ?? params.query ?? params.data;

  if (typeof raw === 'string' && raw.trim()) {
    try {
      return JSON.parse(raw);
    } catch {
      // Fall through when the body is not valid JSON.
    }
  }

  if (raw && typeof raw === 'object' && Object.keys(raw).length > 0) {
    return { ...raw };
  }

  return {};
}

function getRequestInput(params = {}) {
  const input = parseRequestBody(params);
  INPUT_KEYS.forEach((key) => {
    if (params[key] != null && params[key] !== '' && input[key] == null) {
      input[key] = params[key];
    }
  });
  return input;
}

function getZip(input) {
  return String(input.zip || input.zipcode || input.zip_code || input.postal_code || '').trim();
}

function getLocationType(input) {
  const raw = String(input.location_type || input.locationType || input.location || '').trim().toLowerCase();
  if (['zip', 'manual', 'zipcode', 'postal', 'postal_code', 'manually enter my zip code'].includes(raw)) {
    return 'zip';
  }
  if (['geo', 'geolocation', 'current', 'current_location', 'auto', 'use my current location'].includes(raw)) {
    return 'geolocation';
  }
  if (getZip(input)) {
    return 'zip';
  }
  if (input.lat != null && input.lng != null) {
    return 'geolocation';
  }
  return null;
}

function parseCoordinates(input) {
  const lat = Number(input.lat);
  const lng = Number(input.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return { lat, lng };
}

async function resolveSearchOrigin(input, geocodeClient) {
  const locationType = getLocationType(input);
  const zip = getZip(input);

  if (locationType === 'zip') {
    if (!zip) {
      const error = new Error('zip is required when using manual zip search');
      error.statusCode = 400;
      throw error;
    }
    const geocoded = await geocodeClient.geocode(zip);
    return {
      lat: geocoded.lat,
      lng: geocoded.lng,
      formattedAddress: geocoded.formattedAddress,
      locationSource: 'zip',
      searchQuery: zip,
    };
  }

  if (locationType === 'geolocation') {
    const coords = parseCoordinates(input);
    if (!coords) {
      const error = new Error('Valid lat and lng are required for current location search');
      error.statusCode = 400;
      throw error;
    }
    return { ...coords, locationSource: 'geolocation' };
  }

  const coords = parseCoordinates(input);
  if (coords) {
    return { ...coords, locationSource: 'geolocation' };
  }

  const textQuery = zip || String(input.city || input.address || '').trim();
  if (textQuery) {
    const geocoded = await geocodeClient.geocode(textQuery);
    return {
      lat: geocoded.lat,
      lng: geocoded.lng,
      formattedAddress: geocoded.formattedAddress,
      locationSource: zip ? 'zip' : 'address',
      searchQuery: textQuery,
    };
  }

  return null;
}

function matchesStoreFilters(store, input) {
  const sourceCode = String(input.source_code || '').trim().toLowerCase();
  if (sourceCode && !String(store.source_code || '').toLowerCase().includes(sourceCode)) {
    return false;
  }

  const businessName = String(input.name || input.business_name || '').trim().toLowerCase();
  if (businessName && !String(store.name || '').toLowerCase().includes(businessName)) {
    return false;
  }

  return true;
}

function errorStatusCode(error) {
  if (error.statusCode) {
    return error.statusCode;
  }
  if (error.message.includes('MAPS_API_KEY is required')) {
    return 503;
  }
  if (error.message.includes('Geocode failed') || error.message.includes('zip is required')) {
    return 400;
  }
  return 500;
}

export async function main(params) {
  const logger = createLogger({ action: 'get-stores', requestId: params.requestId });
  try {
    const runtimeParams = await resolveActionParams(params, logger);
    if (!guardStoreLocatorEnabled(runtimeParams)) {
      return json(200, { enabled: false, stores: [] });
    }

    const input = getRequestInput(runtimeParams);
    const radius = input.radius ?? 25;
    const unit = input.unit === 'km' ? 'km' : 'mi';
    const geocodeClient = createGeocodeClient(runtimeParams, logger);
    const origin = await resolveSearchOrigin(input, geocodeClient);

    if (!origin) {
      return json(400, { error: 'Provide lat/lng or zip/city/address' });
    }

    const repo = createStoreRepository(runtimeParams, logger);
    const stores = (await repo.getEnabled()).filter((store) => matchesStoreFilters(store, input));
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
    const statusCode = errorStatusCode(error);
    return json(statusCode, {
      error: statusCode === 500 ? 'Unable to get stores' : error.message,
    });
  }
}
