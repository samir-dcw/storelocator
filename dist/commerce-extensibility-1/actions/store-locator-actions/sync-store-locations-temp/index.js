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

;// ./src/commerce-extensibility-1/actions/sync-store-locations/index.js



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

async function main(params) {
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

module.exports = __webpack_exports__;
/******/ })()
;