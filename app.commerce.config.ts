import { defineConfig } from '@adobe/aio-commerce-lib-app/config';

export default defineConfig({
  metadata: {
    id: 'magazine-editorial-hub',
    displayName: 'Digital Magazine Hub',
    description:
      'Magazine only ACCS Page Builder hub that aggregates editions, categories, and shoppable articles with Commerce product enrichment.',
    version: '1.0.0',
  },
  app: {
    adminUiExtensions: [
      {
        id: 'admin-blog-grid',
        title: 'Admin Blog Grid',
        resource: 'magazine-editorial-hub/admin',
        menu: {
          label: 'Magazine Hub',
          parent: 'Content',
        },
      },
    ],
  },
});
