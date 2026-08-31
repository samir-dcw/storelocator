/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	const __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
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

;// ./src/commerce-extensibility-1/actions/utils/commerce-graphql-client.js
function createCommerceGraphQLClient(params = {}, logger = console) {
  const endpoint = params.COMMERCE_GRAPHQL_ENDPOINT || process.env.COMMERCE_GRAPHQL_ENDPOINT;

  async function query(queryText, variables = {}) {
    if (!endpoint) {
      throw new Error('COMMERCE_GRAPHQL_ENDPOINT is required');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: queryText, variables }),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.errors) {
      const message = body.errors?.[0]?.message || `GraphQL request failed with ${response.status}`;
      throw new Error(message);
    }
    return body.data;
  }

  function buildMsiAvailabilityQuery() {
    return `query StockBySource($sku: String!, $source_code: String!) {
      products(filter: { sku: { eq: $sku } }) {
        items {
          sku
          stock_status
          source_items(filter: { source_code: { eq: $source_code } }) {
            source_code
            quantity
            status
          }
        }
      }
    }`;
  }

  return {
    query,
    buildMsiAvailabilityQuery,
    async fetchStockBySource(sku, sourceCode) {
      const data = await query(buildMsiAvailabilityQuery(), { sku, source_code: sourceCode });
      return data?.products?.items?.[0] || null;
    },
  };
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

;// ./src/commerce-extensibility-1/actions/check-stock/index.js





function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

async function main(params) {
  const logger = createLogger({ action: 'check-stock', requestId: params.requestId });
  try {
    if (!guardStoreLocatorEnabled(params)) {
      return json(200, { enabled: false, stock: null });
    }

    const input = params.query || params.body || {};
    const sku = input.sku || input.product_id;
    const sourceCode = input.source_code;
    if (!sku || !sourceCode) {
      return json(400, { error: 'sku/product_id and source_code are required' });
    }

    const cache = createIOStateClient(params, logger);
    const cacheKey = `stock:${sku}:${sourceCode}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return json(200, { source_code: sourceCode, sku, stock: cached, cached: true, enabled: true });
    }

    const commerce = createCommerceGraphQLClient(params, logger);
    const item = await commerce.fetchStockBySource(sku, sourceCode);
    const sourceItem = item?.source_items?.[0] || null;
    const stock = {
      sku,
      source_code: sourceCode,
      in_stock: Boolean(sourceItem?.status),
      quantity: Number(sourceItem?.quantity || 0),
    };

    await cache.put(cacheKey, stock, 120);
    return json(200, { source_code: sourceCode, sku, stock, cached: false, enabled: true });
  } catch (error) {
    logger.error('check-stock.failed', { error: error.message });
    return json(500, { error: 'Unable to check stock' });
  }
}

module.exports = __webpack_exports__;
/******/ })()
;