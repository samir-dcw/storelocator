import {
  byCodeAndLevel,
  getConfiguration,
  initialize,
} from '@adobe/aio-commerce-lib-config';
import appManifest from '../../.generated/app.commerce.manifest.json' with { type: 'json' };

let configLibReady = false;

function ensureConfigLibrary() {
  if (!configLibReady) {
    initialize({ schema: appManifest.businessConfig.schema });
    configLibReady = true;
  }
}

function configArrayToObject(config = []) {
  return config.reduce((acc, item) => {
    if (item?.name) {
      acc[item.name] = item.value;
    }
    return acc;
  }, {});
}

function mergeParamsWithBusinessConfig(params, businessValues) {
  const merged = { ...businessValues };

  // Empty IO_STATE_KEY from config must not win over the stable default.
  if (merged.IO_STATE_KEY === '' || merged.IO_STATE_KEY == null) {
    delete merged.IO_STATE_KEY;
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      merged[key] = value;
    }
  });

  if (!merged.IO_STATE_KEY) {
    merged.IO_STATE_KEY = 'store-locator';
  }

  return merged;
}

function getScopeSelector(params) {
  const scopeCode = params.scope_code || params.scopeCode || 'global';
  const scopeLevel = params.scope_level || params.scopeLevel || 'global';
  return byCodeAndLevel(scopeCode, scopeLevel);
}

export async function resolveActionParams(params = {}, logger = console) {
  ensureConfigLibrary();

  const encryptionKey = params.AIO_COMMERCE_CONFIG_ENCRYPTION_KEY
    || process.env.AIO_COMMERCE_CONFIG_ENCRYPTION_KEY;

  try {
    const { config } = await getConfiguration(getScopeSelector(params), { encryptionKey });
    return mergeParamsWithBusinessConfig(params, configArrayToObject(config));
  } catch (error) {
    logger.warn?.('business-config-loader.fallback', { error: error.message });
    return params;
  }
}
