import filesLib from '@adobe/aio-lib-files';
import libState from '@adobe/aio-lib-state';

// Files = durable App Builder storage (no TTL). State = optional fast cache.
const CACHE_TTL_SECONDS = Math.min(libState.MAX_TTL || 31536000, 86400 * 30); // 30 days cache

let filesClientPromise = null;
let stateClientPromise = null;

async function getFilesClient() {
  if (!filesClientPromise) {
    filesClientPromise = filesLib.init();
  }
  return filesClientPromise;
}

async function getStateClient() {
  if (!stateClientPromise) {
    stateClientPromise = libState.init();
  }
  return stateClientPromise;
}

function normalizeNamespace(namespace) {
  const normalized = String(namespace || 'store-locator')
    .trim()
    .replace(/[^a-zA-Z0-9-_.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_.]+|[-_.]+$/g, '');

  return normalized || 'store-locator';
}

function filePath(namespace, collection) {
  return `${normalizeNamespace(namespace)}/${collection}.json`;
}

function cacheKey(namespace, collection) {
  return `${normalizeNamespace(namespace)}-${collection}`;
}

function cloneStore(store) {
  return store ? JSON.parse(JSON.stringify(store)) : store;
}

function parseStoredValue(value) {
  if (value === undefined || value === null || value === '') {
    return [];
  }

  let payload = value;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      return [];
    }
  }

  return Array.isArray(payload) ? payload : [];
}

async function readFromFiles(path) {
  const files = await getFilesClient();
  try {
    const content = await files.read(path);
    if (!content) {
      return [];
    }
    return parseStoredValue(content.toString('utf8'));
  } catch {
    return [];
  }
}

async function writeToFiles(path, items) {
  const files = await getFilesClient();
  await files.write(path, JSON.stringify(items, null, 2));
}

async function readFromCache(key) {
  try {
    const state = await getStateClient();
    const cached = await state.get(key);
    if (!cached || cached.value === undefined) {
      return null;
    }
    return parseStoredValue(cached.value);
  } catch {
    return null;
  }
}

async function writeToCache(key, items) {
  try {
    const state = await getStateClient();
    await state.put(key, JSON.stringify(items), { ttl: CACHE_TTL_SECONDS });
  } catch {
    // Cache write failures must not block durable persistence.
  }
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

export function createStoreRepository(params = {}, logger = console) {
  const namespace = normalizeNamespace(params.IO_STATE_KEY || process.env.IO_STATE_KEY || 'store-locator');
  const collection = 'store-locations';
  const path = filePath(namespace, collection);
  const key = cacheKey(namespace, collection);

  async function setAll(items) {
    const value = items.map(cloneStore);
    await writeToFiles(path, value);
    await writeToCache(key, value);
    logger.info?.('store-repository.setAll', { namespace, path, key, count: value.length, storage: 'files' });
    return value.map(cloneStore);
  }

  async function getAll() {
    // Prefer durable Files storage.
    let items = await readFromFiles(path);

    // One-time migration: older installs stored stores only in State (TTL cache).
    if (items.length === 0) {
      const legacy = await readFromCache(key);
      if (legacy && legacy.length > 0) {
        logger.info?.('store-repository.migrateFromState', { namespace, path, count: legacy.length });
        items = legacy;
        await writeToFiles(path, items);
      }
    }

    if (items.length > 0) {
      await writeToCache(key, items);
    }

    return items.map(cloneStore);
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

  return { getAll, setAll, upsert, remove, getEnabled, getById, path, key, namespace };
}

export { normalizeStore };
