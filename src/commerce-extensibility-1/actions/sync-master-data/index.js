import { queryMesh } from '../utils/mesh-client.js';
import { cacheKey, putJson } from '../utils/state-cache.js';

const QUERY = `query MagazineHubSync { magazineHub { magazineIssues { items { id title categories articles { id title sku enabled body heroImage { url alt } } } } } }`;

export async function main(params) {
  try {
    const data = await queryMesh(params.MESH_ENDPOINT, QUERY);
    const articles = extractArticles(data);
    const key = cacheKey(params.IO_STATE_KEY || 'magazine', 'master-data');
    await putJson(key, { articles, updatedAt: new Date().toISOString() }, 'magazine');
    return ok({ refreshed: articles.length });
  } catch (error) {
    return fail(error);
  }
}

function extractArticles(data) {
  const issues = data?.magazineHub?.magazineIssues?.items || [];
  return issues.flatMap((issue) => issue.articles || []).filter(Boolean);
}

function ok(body) {
  return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

function fail(error) {
  return { statusCode: error.statusCode || 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: error.message || 'Sync failed' }) };
}
