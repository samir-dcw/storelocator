import { registrationRuntimeAction } from '@adobe/aio-commerce-lib-app/actions/registration';

function toMenuExtensionId(namespace) {
  return (namespace || 'store_locator').replace(/-/g, '_');
}

function buildRegistration(namespace) {
  const extensionId = toMenuExtensionId(namespace);

  return {
    menuItems: [
      {
        id: `${extensionId}::apps`,
        title: 'Store Locator',
        isSection: true,
      },
      {
        id: `${extensionId}::store_locator`,
        title: 'Store Locator',
        parent: `${extensionId}::apps`,
        sortOrder: 1,
      },
      {
        id: 'digital_magazine::apps',
        title: 'Digital Magazine',
        isSection: true,
      },
      {
        id: 'digital_magazine::editorial_hub',
        title: 'Editorial Hub',
        parent: 'digital_magazine::apps',
        sortOrder: 1,
      },
    ],
  };
}

export async function main(params) {
  const registration = buildRegistration(process.env.__OW_NAMESPACE);
  return registrationRuntimeAction({ registration })(params);
}
