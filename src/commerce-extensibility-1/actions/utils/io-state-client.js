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

export function createIOStateClient(params = {}, logger = console) {
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
