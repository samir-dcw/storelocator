import { State } from '@adobe/aio-lib-state';

const caches = new Map();

function getStateClient(namespace = 'default') {
  if (!caches.has(namespace)) {
    caches.set(namespace, State.init());
  }
  return caches.get(namespace);
}

export async function getJson(key, namespace) {
  const state = await getStateClient(namespace);
  const result = await state.get(key);
  if (!result || result.value === undefined || result.value === null) return null;
  return typeof result.value === 'string' ? JSON.parse(result.value) : result.value;
}

export async function putJson(key, value, namespace, ttl) {
  const state = await getStateClient(namespace);
  const payload = JSON.stringify(value);
  await state.put(key, payload, ttl ? { ttl } : undefined);
  return value;
}

export function cacheKey(prefix, suffix) {
  return `${prefix}:${suffix}`;
}
