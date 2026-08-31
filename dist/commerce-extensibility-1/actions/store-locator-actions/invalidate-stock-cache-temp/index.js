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

;// ./src/commerce-extensibility-1/actions/invalidate-stock-cache/index.js



function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

async function main(params) {
  const logger = createLogger({ action: 'invalidate-stock-cache', requestId: params.requestId });
  try {
    const event = params.event || params.body || params;
    const productId = event.product_id || event.productId;
    const websiteId = event.website_id || event.websiteId;
    if (!productId || !websiteId) {
      return json(400, { error: 'product_id and website_id are required' });
    }

    const state = createIOStateClient(params, logger);
    const cacheKey = `stock:${productId}:${websiteId}`;
    const processedKey = `processed:${cacheKey}:${event.event_id || event.id || 'unknown'}`;
    if (await state.get(processedKey)) {
      return json(200, { skipped: true });
    }

    await state.delete(cacheKey);
    await state.put(processedKey, true, 86400);
    return json(200, { invalidated: true, cacheKey });
  } catch (error) {
    logger.error('invalidate-stock-cache.failed', { error: error.message });
    return json(500, { error: 'Unable to invalidate stock cache' });
  }
}

module.exports = __webpack_exports__;
/******/ })()
;