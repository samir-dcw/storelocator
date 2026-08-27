import { defineConfig } from '@adobe/aio-commerce-lib-app/config';

export default defineConfig({
  metadata: {
    id: 'digital-magazine-editorial-hub',
    displayName: 'Digital Magazine Editorial Hub',
    description: 'Commerce-connected editorial platform aggregating ACCS Page Builder magazine content with live product data, admin management, and storefront delivery.',
    version: '1.0.0',
  },
  businessConfig: {
    schema: [
      { name: 'COMMERCE_GRAPHQL_ENDPOINT', type: 'url', label: 'Commerce GraphQL Endpoint', description: 'GraphQL endpoint used by get-magazine-products and related enrichment actions.' },
      { name: 'MAGAZINE_CMS_ENDPOINT', type: 'url', label: 'Magazine CMS Endpoint', description: 'ACCS Page Builder CMS endpoint used by sync-magazine-content.' },
      { name: 'IO_STATE_KEY', type: 'text', label: 'IO State Key', description: 'Prefix used for aio-lib-state cache entries across magazine reads and invalidation flows.' },
    ],
  },
  eventing: {
    subscriptions: [
      {
        event: {
          name: 'observer.catalog_product_save_commit_after',
          fields: [
            { name: 'id' },
            { name: 'name' },
            { name: 'price' },
            { name: 'status' },
            { name: 'qty' },
            { name: 'updated_at' },
          ],
        },
        actions: [{ name: 'cache-invalidate-on-product-save' }],
      },
    ],
  },
});
