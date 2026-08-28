import { defineConfig } from '@adobe/aio-commerce-lib-app/config';

export default defineConfig({
  metadata: {
    id: 'proj-5a3228b8-c9f3-4684-895b-480e4de85cc7',
    displayName: 'proj-5a3228b8-c9f3-4684-895b-480e4de85cc7',
    description: 'Commerce App Builder application',
    version: '1.0.0',
  },
  businessConfig: {
    schema: [
      {
        name: 'enable_store_locator',
        type: 'boolean',
        label: 'Enable Store Locator',
        description: 'Turn the store locator UI and availability calls on or off.',
        default: true,
      },
      {
        name: 'MAPS_API_KEY',
        type: 'text',
        label: 'Maps API Key',
        description: 'Google Maps / geocoding API key used by the locator UI.',
        default: '',
      },
      {
        name: 'COMMERCE_GRAPHQL_ENDPOINT',
        type: 'url',
        label: 'Commerce GraphQL Endpoint',
        description: 'Endpoint used to query Adobe Commerce stock data.',
        default: '',
      },
      {
        name: 'PIM_API_KEY',
        type: 'text',
        label: 'PIM API Key',
        description: 'Secret used by the admin sync worker to authenticate to the PIM.',
        default: '',
      },
      {
        name: 'PIM_API_ENDPOINT',
        type: 'url',
        label: 'PIM API Endpoint',
        description: 'Source endpoint used by the store-location sync worker.',
        default: '',
      },
    ],
  },
});
