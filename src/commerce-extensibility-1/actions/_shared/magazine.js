import { buildCacheKey, ensureArray, getVisibilityStatus } from './store.js';

export function normalizeArticle(input = {}) {
  const article = {
    id: input.id || input.slug,
    slug: input.slug || input.id,
    title: input.title || '',
    category: input.category || '',
    issue: input.issue || '',
    location: input.location || input.store || '',
    publicationDate: input.publicationDate || input.publishedAt || new Date().toISOString(),
    enabled: Boolean(input.enabled),
    summary: input.summary || '',
    body: input.body || '',
    content: input.content || input.body || '',
    skuRefs: ensureArray(input.skuRefs || input.relatedSkus),
    relatedProducts: ensureArray(input.relatedProducts),
    cmsSourceId: input.cmsSourceId || '',
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
  article.visibility = getVisibilityStatus(article);
  return article;
}

export function filterVisibleArticles(articles = []) {
  return articles.filter((article) => getVisibilityStatus(article) === 'visible');
}

export function sortArticles(articles = []) {
  return [...articles].sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());
}

export function buildArticleCacheKeys(prefix, articleId) {
  return [buildCacheKey(prefix, 'articles'), buildCacheKey(prefix, 'articles', articleId)];
}

export function buildIssueCacheKeys(prefix, issueId) {
  return [buildCacheKey(prefix, 'issues'), buildCacheKey(prefix, 'issues', issueId)];
}

export function buildProductCacheKeys(prefix, sku) {
  return [buildCacheKey(prefix, 'products', sku)];
}

export function filterByQuery(articles = [], query = {}) {
  return articles.filter((article) => {
    if (query.category && article.category !== query.category) return false;
    if (query.issue && article.issue !== query.issue) return false;
    if (query.location && article.location !== query.location) return false;
    if (query.status === 'visible' && getVisibilityStatus(article) !== 'visible') return false;
    if (query.status === 'hidden' && getVisibilityStatus(article) === 'visible') return false;
    return true;
  });
}
