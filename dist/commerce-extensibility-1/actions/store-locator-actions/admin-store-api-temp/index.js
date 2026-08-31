/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
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
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
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

;// ./src/commerce-extensibility-1/actions/utils/store-repository.js
function memoryStore() {
  if (!globalThis.__storeLocatorMemoryState) {
    globalThis.__storeLocatorMemoryState = new Map();
  }
  return globalThis.__storeLocatorMemoryState;
}

function stateKey(namespace, collection) {
  return `${namespace}:${collection}`;
}

function now() {
  return Date.now();
}

function cloneStore(store) {
  return store ? JSON.parse(JSON.stringify(store)) : store;
}

function readCollection(key) {
  const item = memoryStore().get(key);
  if (!item) {
    return [];
  }
  if (item.expiresAt && item.expiresAt <= now()) {
    memoryStore().delete(key);
    return [];
  }
  return Array.isArray(item.value) ? item.value : [];
}

function normalizeStore(store) {
  const id = String(store.id || '').trim();
  const name = String(store.name || '').trim();
  if (!id) {
    throw new Error('Store id is required');
  }
  if (!name) {
    throw new Error('Store name is required');
  }

  return {
    id,
    name,
    source_code: String(store.source_code || store.sourceCode || id).trim(),
    latitude: store.latitude === '' || store.latitude == null ? null : Number(store.latitude),
    longitude: store.longitude === '' || store.longitude == null ? null : Number(store.longitude),
    address: String(store.address || '').trim(),
    hours: String(store.hours || '').trim(),
    phone: String(store.phone || '').trim(),
    amenities: Array.isArray(store.amenities)
      ? store.amenities.map((item) => String(item).trim()).filter(Boolean)
      : [],
    enabled: store.enabled !== false,
    updatedAt: new Date().toISOString(),
  };
}

function createStoreRepository(params = {}, logger = console) {
  const namespace = params.IO_STATE_KEY || process.env.IO_STATE_KEY || 'store-locator';
  const collection = 'store-locations';
  const key = stateKey(namespace, collection);

  async function getAll() {
    return readCollection(key).map(cloneStore);
  }

  async function setAll(items, ttlSeconds = 3600) {
    memoryStore().set(key, {
      value: items.map(cloneStore),
      expiresAt: ttlSeconds ? now() + ttlSeconds * 1000 : null,
    });
    logger.info?.('store-repository.setAll', { namespace, count: items.length });
    return getAll();
  }

  async function upsert(store) {
    const normalized = normalizeStore(store);
    const items = await getAll();
    const index = items.findIndex((item) => item.id === normalized.id);
    const next = [...items];
    if (index >= 0) {
      next[index] = { ...next[index], ...normalized, createdAt: next[index].createdAt || normalized.updatedAt };
      await setAll(next);
      return next[index];
    }
    const created = { ...normalized, createdAt: normalized.updatedAt };
    next.push(created);
    await setAll(next);
    return created;
  }

  async function remove(id) {
    const targetId = String(id || '').trim();
    const items = await getAll();
    const next = items.filter((item) => item.id !== targetId);
    await setAll(next);
    return items.length !== next.length;
  }

  async function getEnabled() {
    return (await getAll()).filter((item) => item.enabled !== false);
  }

  async function getById(id) {
    const targetId = String(id || '').trim();
    return (await getAll()).find((item) => item.id === targetId) || null;
  }

  return { getAll, setAll, upsert, remove, getEnabled, getById };
}



;// ./src/commerce-extensibility-1/actions/admin-store-api/index.js



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

async function main(params) {
  const logger = createLogger({ action: 'admin-store-api', requestId: params.requestId });
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
    logger.error('admin-store-api.failed', { error: error.message });
    return json(500, { error: 'Unable to process store API request' });
  }
}

module.exports = __webpack_exports__;
/******/ })()
;