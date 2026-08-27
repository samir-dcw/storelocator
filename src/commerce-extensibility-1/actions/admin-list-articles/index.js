import { queryMesh } from '../utils/mesh-client.js';
import { filterEnabledArticles } from '../utils/validate-params.js';

const QUERY = `query AdminMagazineHub { magazineHub { magazineIssues { items { id title categories articles { id title sku enabled body heroImage { url alt } } } } } }`;

export async function main(params) {
  try {
    const data = await queryMesh(params.MESH_ENDPOINT, QUERY);
    const issues = data?.magazineHub?.magazineIssues?.items || [];
    const articles = issues.flatMap((issue) => issue.articles || []).filter(Boolean);
    return response(200, { articles, enabledArticles: filterEnabledArticles(articles) });
  } catch (error) {
    return response(error.statusCode || 500, { error: error.message || 'Failed to list articles' });
  }
}

function response(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}
