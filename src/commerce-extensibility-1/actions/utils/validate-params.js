export function parseMagazineQuery(params = {}) {
  const category = sanitizeToken(params.category);
  const editionId = sanitizeToken(params.editionId || params.edition_id || params.edition);
  const sku = sanitizeToken(params.sku);

  const invalid = [];
  if (params.category && !category) invalid.push('category');
  if (params.editionId && !editionId) invalid.push('editionId');
  if (params.edition_id && !editionId) invalid.push('edition_id');
  if (params.edition && !editionId) invalid.push('edition');
  if (params.sku && !sku) invalid.push('sku');

  if (invalid.length) {
    const error = new Error(`Invalid query parameter(s): ${invalid.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  return { category, editionId, sku };
}

export function sanitizeToken(value) {
  if (value === undefined || value === null) return '';
  const trimmed = String(value).trim();
  return /^[A-Za-z0-9._-]+$/.test(trimmed) ? trimmed : '';
}

export function normalizeEnabledArticle(article) {
  return article && article.enabled === false ? null : article;
}

export function filterEnabledArticles(articles = []) {
  return articles.filter((article) => article && article.enabled !== false);
}
