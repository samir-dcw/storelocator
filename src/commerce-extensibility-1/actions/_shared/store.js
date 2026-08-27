import libDb from '@adobe/aio-lib-db';
import libState from '@adobe/aio-lib-state';

const COLLECTIONS = {
  articles: 'articles',
  issues: 'issues',
  categories: 'categories',
};

function normalizePrefix(prefix) {
  return String(prefix || '').trim().replace(/:+$/, '');
}

export { normalizePrefix };

export function getCollectionName(type) {
  if (!COLLECTIONS[type]) {
    throw new Error(`Unsupported collection type: ${type}`);
  }
  return COLLECTIONS[type];
}

export async function getDbClient() {
  return libDb.getClient();
}

export async function getStateClient() {
  return libState.init();
}

export function buildCacheKey(prefix, ...parts) {
  const normalizedPrefix = normalizePrefix(prefix);
  const suffix = parts.filter(Boolean).join(':');
  return normalizedPrefix ? `${normalizedPrefix}:${suffix}` : suffix;
}

export async function readThroughCache({ stateClient, key, ttlSeconds = 300, loader }) {
  const cached = await stateClient.get(key);
  if (cached && cached.value !== undefined) return cached.value;
  const value = await loader();
  await stateClient.put(key, value, { ttl: ttlSeconds });
  return value;
}

export async function invalidateKeys(stateClient, keys) {
  await Promise.all([...new Set(keys.filter(Boolean))].map((key) => stateClient.delete(key).catch(() => undefined)));
}

export function getVisibilityStatus(article) {
  return article.enabled && new Date(article.publicationDate) <= new Date() ? 'visible' : 'hidden';
}

export function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}
