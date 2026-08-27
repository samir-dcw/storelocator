import { saveArticleToPageBuilder, toPageBuilderArticle } from '../utils/page-builder-client.js';
import { cacheKey, putJson } from '../utils/state-cache.js';

export async function main(params) {
  try {
    const article = normalize(params);
    const saved = await saveArticleToPageBuilder(params.PAGE_BUILDER_ENDPOINT || params.MESH_ENDPOINT, toPageBuilderArticle(article));
    const key = cacheKey(params.IO_STATE_KEY || 'magazine', `article:${saved.id || article.id}`);
    await putJson(key, saved, 'magazine');
    return response(200, { article: saved });
  } catch (error) {
    return response(error.statusCode || 500, { error: error.message || 'Failed to save article' });
  }
}

function normalize(params) {
  if (!params || !params.title) {
    const error = new Error('Missing article title');
    error.statusCode = 400;
    throw error;
  }
  return {
    id: params.id ? String(params.id) : undefined,
    title: String(params.title),
    category: params.category ? String(params.category) : '',
    editionId: params.editionId ? String(params.editionId) : '',
    sku: params.sku ? String(params.sku) : '',
    enabled: params.enabled !== false,
    body: params.body ? String(params.body) : '',
    heroImage: params.heroImage || null,
  };
}

function response(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}
