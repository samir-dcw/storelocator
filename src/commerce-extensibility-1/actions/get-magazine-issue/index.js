import { Core } from '@adobe/aio-sdk';
import { getCollectionName, getDbClient, getStateClient, readThroughCache, normalizePrefix } from '../_shared/store.js';

const { log } = Core;

function json(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

export async function main(params) {
  const logger = log;
  try {
    const issueId = params.issueId || params.id || (params.body && params.body.issueId);
    if (!issueId) return json(400, { error: 'issueId is required' });
    const prefix = normalizePrefix(params.IO_STATE_KEY || 'magazine');
    const state = await getStateClient(logger);
    const db = await getDbClient(logger);
    const issue = await readThroughCache({
      stateClient: state,
      key: `${prefix}:issues:${issueId}`,
      loader: async () => {
        const collection = await db.collection(getCollectionName('issues'));
        return collection.findOne({ id: issueId });
      },
      logger,
    });
    return json(200, { issue });
  } catch (error) {
    logger.error('get-magazine-issue failed', { message: error.message });
    return json(500, { error: 'Failed to load magazine issue' });
  }
}
