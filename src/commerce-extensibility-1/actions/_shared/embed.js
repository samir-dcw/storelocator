export function createEmbedConfig(props = {}) {
  return {
    endpoint: props.endpoint || '',
    edition: props.edition || '',
    category: props.category || '',
    location: props.location || '',
    articleCount: Number(props.articleCount || 12),
    shoppable: Boolean(props.shoppable),
  };
}
