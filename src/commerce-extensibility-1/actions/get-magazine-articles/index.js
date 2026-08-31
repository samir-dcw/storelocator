import { Core } from '@adobe/aio-sdk';
import { getCollectionName, getDbClient, getStateClient, readThroughCache, normalizePrefix } from '../_shared/store.js';
import { filterVisibleArticles, sortArticles, filterByQuery } from '../_shared/magazine.js';

const { log } = Core;

function json(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

export async function main(params) {
  const logger = log;
  try {
    const query = params.query || params;
    const prefix = normalizePrefix(params.IO_STATE_KEY || query.IO_STATE_KEY || 'magazine');
    const state = await getStateClient(logger);
    const db = await getDbClient(logger);
    const articles = await readThroughCache({
      stateClient: state,
      key: `${prefix}:articles:${query.category || 'all'}:${query.issue || 'all'}:${query.location || 'all'}:${query.status || 'all'}`,
      loader: async () => (await (await db.collection(getCollectionName('articles'))).find({}).toArray()),
    });
    const filtered = filterByQuery(articles, query);
    return json(200, { articles: sortArticles(filterVisibleArticles(filtered)) });
  } catch (error) {
    logger.error('get-magazine-articles failed', { message: error.message });
    return json(500, { error: 'Failed to load magazine articles' });
  }
}
