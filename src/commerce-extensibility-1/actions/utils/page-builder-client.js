export async function saveArticleToPageBuilder(endpoint, article) {
  const response = await fetch(endpoint, {
    method: article.id ? 'PUT' : 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(article),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const error = new Error(`Page Builder write failed with ${response.status}`);
    error.statusCode = response.status;
    error.body = text;
    throw error;
  }
  return response.json().catch(() => article);
}

export function toPageBuilderArticle(article) {
  return {
    id: article.id,
    title: article.title,
    category: article.category,
    editionId: article.editionId,
    sku: article.sku,
    enabled: article.enabled !== false,
    body: article.body,
    heroImage: article.heroImage,
  };
}
