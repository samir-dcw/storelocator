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



;// ./src/commerce-extensibility-1/actions/list-enabled-stores/index.js



function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

async function main(params) {
  const logger = createLogger({ action: 'list-enabled-stores', requestId: params.requestId });
  try {
    const repo = createStoreRepository(params, logger);
    const items = await repo.getEnabled();
    return json(200, { items });
  } catch (error) {
    logger.error('list-enabled-stores.failed', { error: error.message });
    return json(500, { error: 'Unable to list enabled store locations' });
  }
}

module.exports = __webpack_exports__;
/******/ })()
;