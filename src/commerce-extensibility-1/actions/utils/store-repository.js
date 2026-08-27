function memoryStore() {
  if (!globalThis.__storeLocatorMemoryState) {
    globalThis.__storeLocatorMemoryState = new Map();
  }
  return globalThis.__storeLocatorMemoryState;
}

function stateKey(namespace, collection) {
  return `${namespace}:${collection}`;
}

export function createStoreRepository(params = {}, logger = console) {
  const namespace = params.IO_STATE_KEY || process.env.IO_STATE_KEY || 'store-locator';
  const collection = 'store-locations';
  const key = stateKey(namespace, collection);

  async function getAll() {
    const item = memoryStore().get(key);
    return Array.isArray(item?.value) ? item.value : [];
  }

  async function setAll(items, ttlSeconds = 3600) {
    memoryStore().set(key, {
      value: items,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
    logger.info?.('store-repository.setAll', { namespace, count: items.length });
    return items;
  }

  async function upsert(store) {
    const items = await getAll();
    const index = items.findIndex((item) => item.id === store.id);
    const next = [...items];
    if (index >= 0) next[index] = { ...next[index], ...store };
    else next.push(store);
    await setAll(next);
    return index >= 0 ? next[index] : store;
  }

  async function remove(id) {
    const items = await getAll();
    const next = items.filter((item) => item.id !== id);
    await setAll(next);
    return items.length !== next.length;
  }

  async function getEnabled() {
    return (await getAll()).filter((item) => item.enabled !== false);
  }

  return { getAll, setAll, upsert, remove, getEnabled };
}
