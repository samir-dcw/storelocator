function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return fallback;
}

export function isStoreLocatorEnabled(params = {}) {
  const raw = params.enable_store_locator ?? process.env.ENABLE_STORE_LOCATOR ?? true;
  return normalizeBoolean(raw, true);
}

export function getBusinessConfig(params = {}) {
  return {
    enable_store_locator: isStoreLocatorEnabled(params),
    MAPS_API_KEY: params.MAPS_API_KEY || process.env.MAPS_API_KEY || '',
    COMMERCE_GRAPHQL_ENDPOINT: params.COMMERCE_GRAPHQL_ENDPOINT || process.env.COMMERCE_GRAPHQL_ENDPOINT || '',
    PIM_API_KEY: params.PIM_API_KEY || process.env.PIM_API_KEY || '',
    PIM_API_ENDPOINT: params.PIM_API_ENDPOINT || process.env.PIM_API_ENDPOINT || '',
  };
}

export function guardStoreLocatorEnabled(params = {}) {
  return isStoreLocatorEnabled(params);
}
