import { createLogger } from '../utils/logger.js';
import { createStoreRepository } from '../utils/store-repository.js';

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export async function main(params) {
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
