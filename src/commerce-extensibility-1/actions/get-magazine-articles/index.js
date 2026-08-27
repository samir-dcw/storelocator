import { queryMesh } from '../utils/mesh-client.js';
import { cacheKey, getJson, putJson } from '../utils/state-cache.js';
import { filterEnabledArticles, parseMagazineQuery } from '../utils/validate-params.js';

const MAGAZINE_QUERY = `query MagazineHub($category: String, $editionId: String, $sku: String) {
  magazineHub {
    magazineIssues {
      items {
        id
        title
        categories
        articles {
          id
          title
          sku
          enabled
          body
          heroImage { url alt }
        }
      }
    }
  }
}`;

export async function main(params) {
  try {
    const query = parseMagazineQuery(params || {});
    const key = cacheKey(params.IO_STATE_KEY || 'magazine', `articles:${query.category || 'all'}:${query.editionId || 'all'}:${query.sku || 'all'}`);
    const cached = await getJson(key, 'magazine');
    if (cached) {
      return response(200, { source: 'cache', articles: filterEnabledArticles(cached.articles || cached) });
    }

    const data = await queryMesh(params.MESH_ENDPOINT, MAGAZINE_QUERY, query);
    const articles = extractArticles(data);
    await putJson(key, { articles }, 'magazine');
    return response(200, { source: 'mesh', articles: filterEnabledArticles(articles) });
  } catch (error) {
    if (error.statusCode === 400) return response(400, { error: error.message });
    const fallback = await tryFallback(params);
    if (fallback) return response(200, { source: 'stale-cache', articles: fallback });
    return response(error.statusCode || 500, { error: error.message || 'Unexpected failure' });
  }
}

async function tryFallback(params) {
  try {
    const query = parseMagazineQuery(params || {});
    const key = cacheKey(params.IO_STATE_KEY || 'magazine', `articles:${query.category || 'all'}:${query.editionId || 'all'}:${query.sku || 'all'}`);
    const cached = await getJson(key, 'magazine');
    return cached ? filterEnabledArticles(cached.articles || cached) : null;
  } catch (error) {
    return null;
  }
}

function extractArticles(data) {
  const issues = data?.magazineHub?.magazineIssues?.items || [];
  return issues.flatMap((issue) => issue.articles || []).filter(Boolean);
}

function response(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}
