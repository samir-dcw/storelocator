export function createCommerceGraphQLClient(params = {}, logger = console) {
  const endpoint = params.COMMERCE_GRAPHQL_ENDPOINT || process.env.COMMERCE_GRAPHQL_ENDPOINT;

  async function query(queryText, variables = {}) {
    if (!endpoint) {
      throw new Error('COMMERCE_GRAPHQL_ENDPOINT is required');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: queryText, variables }),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.errors) {
      const message = body.errors?.[0]?.message || `GraphQL request failed with ${response.status}`;
      throw new Error(message);
    }
    return body.data;
  }

  function buildMsiAvailabilityQuery() {
    return `query StockBySource($sku: String!, $source_code: String!) {
      products(filter: { sku: { eq: $sku } }) {
        items {
          sku
          stock_status
          source_items(filter: { source_code: { eq: $source_code } }) {
            source_code
            quantity
            status
          }
        }
      }
    }`;
  }

  return {
    query,
    buildMsiAvailabilityQuery,
    async fetchStockBySource(sku, sourceCode) {
      const data = await query(buildMsiAvailabilityQuery(), { sku, source_code: sourceCode });
      return data?.products?.items?.[0] || null;
    },
  };
}
