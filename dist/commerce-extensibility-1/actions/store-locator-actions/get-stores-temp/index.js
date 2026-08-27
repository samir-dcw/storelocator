/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	const __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter/value functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			if(Array.isArray(definition)) {
/******/ 				var i = 0;
/******/ 				while(i < definition.length) {
/******/ 					var key = definition[i++];
/******/ 					var binding = definition[i++];
/******/ 					if(!__webpack_require__.o(exports, key)) {
/******/ 						if(binding === 0) {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, value: definition[i++] });
/******/ 						} else {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, get: binding });
/******/ 						}
/******/ 					} else if(binding === 0) { i++; }
/******/ 				}
/******/ 			} else {
/******/ 				for(var key in definition) {
/******/ 					if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 						Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  main: () => (/* binding */ main)
});

;// ./src/commerce-extensibility-1/actions/utils/logger.js
function createLogger(context = {}) {
  const base = {
    requestId: context.requestId || context.id || undefined,
    action: context.action || undefined,
  };

  const format = (level, message, details = {}) => {
    const payload = {
      level,
      message,
      ...base,
      ...details,
    };
    return JSON.stringify(payload);
  };

  return {
    info(message, details) {
      console.log(format('info', message, details));
    },
    warn(message, details) {
      console.warn(format('warn', message, details));
    },
    error(message, details) {
      console.error(format('error', message, details));
    },
  };
}

;// ./src/commerce-extensibility-1/actions/utils/io-state-client.js
const DEFAULT_TTL_SECONDS = 300;

function getStateNamespace(params = {}) {
  return params.IO_STATE_KEY || process.env.IO_STATE_KEY || 'store-locator';
}

function memoryStore() {
  if (!globalThis.__storeLocatorMemoryState) {
    globalThis.__storeLocatorMemoryState = new Map();
  }
  return globalThis.__storeLocatorMemoryState;
}

function createIOStateClient(params = {}, logger = console) {
  const namespace = getStateNamespace(params);

  return {
    namespace,
    async get(key) {
      const item = memoryStore().get(`${namespace}:${key}`);
      if (!item) return null;
      if (item.expiresAt && item.expiresAt < Date.now()) {
        memoryStore().delete(`${namespace}:${key}`);
        return null;
      }
      return item.value;
    },
    async put(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
      const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
      memoryStore().set(`${namespace}:${key}`, { value, expiresAt });
      logger.info?.('io-state.put', { namespace, key, ttlSeconds });
      return value;
    },
    async delete(key) {
      memoryStore().delete(`${namespace}:${key}`);
      logger.info?.('io-state.delete', { namespace, key });
    },
    async appendLog(key, entry, ttlSeconds = 86400) {
      const current = (await this.get(key)) || [];
      current.push({ ...entry, timestamp: new Date().toISOString() });
      await this.put(key, current, ttlSeconds);
      return current;
    },
  };
}

;// ./src/commerce-extensibility-1/actions/utils/geocode-client.js
function createGeocodeClient(params = {}, logger = console) {
  const apiKey = params.MAPS_API_KEY || process.env.MAPS_API_KEY;

  async function geocode(address) {
    if (!apiKey) {
      throw new Error('MAPS_API_KEY is required');
    }

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', address);
    url.searchParams.set('key', apiKey);

    const response = await fetch(url);
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.status !== 'OK' || !body.results?.length) {
      throw new Error(body.error_message || `Geocode failed for ${address}`);
    }

    const result = body.results[0];
    const location = result.geometry.location;
    logger.info?.('geocode.success', { address });
    return {
      lat: location.lat,
      lng: location.lng,
      formattedAddress: result.formatted_address,
    };
  }

  return { geocode };
}

;// ./src/commerce-extensibility-1/actions/utils/distance.js
const EARTH_RADIUS_KM = 6371;
const KM_TO_MILES = 0.621371;

function haversineDistance(origin, destination, unit = 'mi') {
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(destination.lat - origin.lat);
  const dLng = toRad(destination.lng - origin.lng);
  const lat1 = toRad(origin.lat);
  const lat2 = toRad(destination.lat);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = EARTH_RADIUS_KM * c;
  return unit === 'km' ? km : km * KM_TO_MILES;
}

function withinRadius(distance, radius) {
  if (radius == null || radius === '') return true;
  return Number(distance) <= Number(radius);
}

;// ./src/commerce-extensibility-1/actions/utils/config.js
function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return fallback;
}

function isStoreLocatorEnabled(params = {}) {
  const raw = params.enable_store_locator ?? process.env.ENABLE_STORE_LOCATOR ?? true;
  return normalizeBoolean(raw, true);
}

function getBusinessConfig(params = {}) {
  return {
    enable_store_locator: isStoreLocatorEnabled(params),
    MAPS_API_KEY: params.MAPS_API_KEY || process.env.MAPS_API_KEY || '',
    COMMERCE_GRAPHQL_ENDPOINT: params.COMMERCE_GRAPHQL_ENDPOINT || process.env.COMMERCE_GRAPHQL_ENDPOINT || '',
    PIM_API_KEY: params.PIM_API_KEY || process.env.PIM_API_KEY || '',
    PIM_API_ENDPOINT: params.PIM_API_ENDPOINT || process.env.PIM_API_ENDPOINT || '',
  };
}

function guardStoreLocatorEnabled(params = {}) {
  return isStoreLocatorEnabled(params);
}

;// ./src/commerce-extensibility-1/actions/get-stores/index.js






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

async function main(params) {
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

module.exports = __webpack_exports__;
/******/ })()
;