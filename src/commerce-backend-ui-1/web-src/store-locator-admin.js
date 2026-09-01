import { attach, register } from '@adobe/uix-guest';
import config from './src/config.json';

function getExtensionIdFromReferrer() {
  if (!document.referrer) {
    return null;
  }

  const match = document.referrer.match(/\/extensionId\/([^/?#]+)/i);
  return match ? decodeURIComponent(match[1]) : null;
}

function getExtensionIdFromHostname() {
  const match = window.location.hostname.match(/^(.+)\.adobeio-static\.net$/i);
  return match ? match[1] : null;
}

function getExtensionId() {
  // Commerce Admin uses org-project-workspace casing in the menu URL, not the
  // lowercase runtime namespace hostname. Both the control frame and UI frame
  // must register/attach with the same id.
  return (
    config.extensionId ||
    getExtensionIdFromReferrer() ||
    getExtensionIdFromHostname() ||
    'store_locator'
  );
}

const EXTENSION_ID = getExtensionId();
const ACTION_PATH = '/api/v1/web/store-locator-actions/admin-store-api';

let guestConnectionPromise = null;

const emptyForm = () => ({
  id: '',
  name: '',
  source_code: '',
  address: '',
  phone: '',
  hours: '',
  latitude: '',
  longitude: '',
  amenities: '',
  enabled: true,
});

function isEmbeddedInHost() {
  return window.parent !== window;
}

function isUiFrame() {
  return isEmbeddedInHost() && window.name.startsWith('uix-guest-');
}

function isControlFrame() {
  return isEmbeddedInHost() && !window.name;
}

function runtimeBaseUrl() {
  return window.location.origin.replace('adobeio-static.net', 'adobeioruntime.net');
}

async function getGuestConnection() {
  if (!isUiFrame()) {
    return null;
  }

  if (!guestConnectionPromise) {
    guestConnectionPromise = attach({ id: EXTENSION_ID });
  }

  return guestConnectionPromise;
}

async function getAuthHeaders() {
  const guest = await getGuestConnection();
  if (!guest) {
    return {};
  }

  const imsToken = guest.sharedContext.get('imsToken');
  const imsOrgId = guest.sharedContext.get('imsOrgId') || guest.sharedContext.get('imsOrg');
  if (!imsToken) {
    throw new Error('Unable to read IMS credentials from Commerce Admin.');
  }
  if (!imsOrgId) {
    throw new Error('Unable to read IMS org ID from Commerce Admin.');
  }

  return {
    Authorization: `Bearer ${imsToken}`,
    'x-gw-ims-org-id': imsOrgId,
    'Content-Type': 'application/json',
  };
}

async function callStoreApi(method, body) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${runtimeBaseUrl()}${ACTION_PATH}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  return payload;
}

function render(root, state) {
  const { stores, selectedId, form, status, error } = state;
  const selectedStore = stores.find((store) => store.id === selectedId);

  root.innerHTML = `
    <header>
      <h1>Store Locator</h1>
      <button type="button" class="primary" data-action="refresh">Refresh</button>
    </header>
    ${error ? `<p class="error">${error}</p>` : ''}
    <div class="layout">
      <section class="panel">
        <h2>Stores</h2>
        <ul class="store-list">
          ${
            stores.length
              ? stores
                  .map(
                    (store) => `
              <li class="${store.id === selectedId ? 'active' : ''} ${store.enabled === false ? 'disabled' : ''}" data-store-id="${store.id}">
                <strong>${escapeHtml(store.name)}</strong>
                <span class="store-meta">${escapeHtml(store.id)}${store.enabled === false ? ' · Disabled' : ''}</span>
              </li>
            `,
                  )
                  .join('')
              : '<li>No stores found.</li>'
          }
        </ul>
      </section>
      <section class="panel">
        <h2>${selectedStore ? 'Edit Store' : 'Add Store'}</h2>
        <form class="form-grid" data-form="store">
          <label>
            Store ID
            <input name="id" value="${escapeAttr(form.id)}" ${selectedStore ? 'readonly' : ''} required />
          </label>
          <label>
            Name
            <input name="name" value="${escapeAttr(form.name)}" required />
          </label>
          <label>
            Source Code
            <input name="source_code" value="${escapeAttr(form.source_code)}" />
          </label>
          <label>
            Address
            <textarea name="address" rows="2">${escapeHtml(form.address)}</textarea>
          </label>
          <label>
            Phone
            <input name="phone" value="${escapeAttr(form.phone)}" />
          </label>
          <label>
            Hours
            <input name="hours" value="${escapeAttr(form.hours)}" />
          </label>
          <label>
            Latitude
            <input name="latitude" value="${escapeAttr(form.latitude)}" />
          </label>
          <label>
            Longitude
            <input name="longitude" value="${escapeAttr(form.longitude)}" />
          </label>
          <label>
            Amenities (comma-separated)
            <input name="amenities" value="${escapeAttr(form.amenities)}" />
          </label>
          <label>
            <span>Enabled</span>
            <input type="checkbox" name="enabled" ${form.enabled ? 'checked' : ''} />
          </label>
          <div class="form-actions">
            <button type="submit" class="primary">${selectedStore ? 'Save Changes' : 'Create Store'}</button>
            <button type="button" data-action="new">New Store</button>
            ${
              selectedStore
                ? '<button type="button" class="danger" data-action="delete">Delete</button>'
                : ''
            }
          </div>
        </form>
        ${status ? `<p class="status">${escapeHtml(status)}</p>` : ''}
      </section>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", '&#39;');
}

function readForm(root) {
  const formElement = root.querySelector('[data-form="store"]');
  const data = new FormData(formElement);
  return {
    id: String(data.get('id') || '').trim(),
    name: String(data.get('name') || '').trim(),
    source_code: String(data.get('source_code') || '').trim(),
    address: String(data.get('address') || '').trim(),
    phone: String(data.get('phone') || '').trim(),
    hours: String(data.get('hours') || '').trim(),
    latitude: String(data.get('latitude') || '').trim(),
    longitude: String(data.get('longitude') || '').trim(),
    amenities: String(data.get('amenities') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    enabled: formElement.querySelector('[name="enabled"]').checked,
  };
}

function storeToForm(store) {
  return {
    id: store.id || '',
    name: store.name || '',
    source_code: store.source_code || '',
    address: store.address || '',
    phone: store.phone || '',
    hours: store.hours || '',
    latitude: store.latitude ?? '',
    longitude: store.longitude ?? '',
    amenities: Array.isArray(store.amenities) ? store.amenities.join(', ') : '',
    enabled: store.enabled !== false,
  };
}

async function bootstrap() {
  const root = document.getElementById('root');

  if (isControlFrame()) {
    await register({ id: EXTENSION_ID, methods: {} });
    root.innerHTML = '';
    return;
  }

  if (isEmbeddedInHost() && !isUiFrame()) {
    root.innerHTML = '';
    return;
  }

  const state = {
    stores: [],
    selectedId: null,
    form: emptyForm(),
    status: isUiFrame() ? 'Connecting to Commerce Admin…' : '',
    error: '',
  };

  const update = () => {
    render(root, state);
    bindEvents();
  };

  const loadStores = async () => {
    state.error = '';
    state.status = 'Loading stores…';
    update();

    try {
      const payload = await callStoreApi('GET');
      state.stores = payload.items || [];
      state.status = `${state.stores.length} store(s) loaded.`;
    } catch (error) {
      state.error = error.message;
      state.status = '';
    }

    update();
  };

  const bindEvents = () => {
    root.querySelector('[data-action="refresh"]')?.addEventListener('click', () => {
      loadStores();
    });

    root.querySelectorAll('[data-store-id]').forEach((element) => {
      element.addEventListener('click', () => {
        const store = state.stores.find((item) => item.id === element.dataset.storeId);
        if (!store) return;
        state.selectedId = store.id;
        state.form = storeToForm(store);
        state.status = `Editing ${store.name}.`;
        update();
      });
    });

    root.querySelector('[data-action="new"]')?.addEventListener('click', () => {
      state.selectedId = null;
      state.form = emptyForm();
      state.status = 'Creating a new store.';
      update();
    });

    root.querySelector('[data-action="delete"]')?.addEventListener('click', async () => {
      if (!state.selectedId || !window.confirm(`Delete store ${state.selectedId}?`)) {
        return;
      }

      try {
        await callStoreApi('DELETE', { id: state.selectedId });
        state.selectedId = null;
        state.form = emptyForm();
        state.status = 'Store deleted.';
        await loadStores();
      } catch (error) {
        state.error = error.message;
        update();
      }
    });

    root.querySelector('[data-form="store"]')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = readForm(root);

      try {
        if (state.selectedId) {
          await callStoreApi('PATCH', payload);
          state.status = `Saved ${payload.name}.`;
        } else {
          await callStoreApi('POST', payload);
          state.selectedId = payload.id;
          state.status = `Created ${payload.name}.`;
        }

        await loadStores();
        const refreshed = state.stores.find((store) => store.id === state.selectedId);
        if (refreshed) {
          state.form = storeToForm(refreshed);
        }
        update();
      } catch (error) {
        state.error = error.message;
        update();
      }
    });
  };

  update();

  if (isUiFrame()) {
    try {
      await getGuestConnection();
    } catch (error) {
      state.error = error.message;
      state.status = '';
      update();
      return;
    }
  }

  await loadStores();
}

bootstrap().catch((error) => {
  const root = document.getElementById('root');
  root.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
});
