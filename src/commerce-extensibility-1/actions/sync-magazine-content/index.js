import { Core } from '@adobe/aio-sdk';
import { getCollectionName, getDbClient, getStateClient, invalidateKeys, normalizePrefix } from '../_shared/store.js';
import { normalizeArticle, buildArticleCacheKeys } from '../_shared/magazine.js';

const { log } = Core;

function json(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

async function fetchCmsContent(endpoint) {
  const response = await fetch(endpoint, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`CMS request failed with status ${response.status}`);
  }
  return response.json();
}

export async function main(params) {
  const logger = log;
  try {
    const endpoint = params.MAGAZINE_CMS_ENDPOINT || params.body?.MAGAZINE_CMS_ENDPOINT;
    if (!endpoint) {
      return json(400, { error: 'MAGAZINE_CMS_ENDPOINT is required' });
    }
    const prefix = normalizePrefix(params.IO_STATE_KEY || params.body?.IO_STATE_KEY || 'magazine');
    const db = await getDbClient(logger);
    const state = await getStateClient(logger);
    const cms = await fetchCmsContent(endpoint);
    const articles = Array.isArray(cms.articles) ? cms.articles.map(normalizeArticle) : [];
    const collection = await db.collection(getCollectionName('articles'));
    for (const article of articles) {
      await collection.updateOne({ id: article.id }, { $set: article }, { upsert: true });
    }
    await invalidateKeys(state, articles.flatMap((article) => buildArticleCacheKeys(prefix, article.id)), logger);
    return json(200, { synced: articles.length });
  } catch (error) {
    logger.error('sync-magazine-content failed', { message: error.message });
    return json(500, { error: 'Failed to sync magazine content' });
  }
}
