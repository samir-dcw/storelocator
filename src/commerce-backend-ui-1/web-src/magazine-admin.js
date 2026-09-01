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
  return (
    config.extensionId ||
    getExtensionIdFromReferrer() ||
    getExtensionIdFromHostname() ||
    'digital_magazine'
  );
}

const EXTENSION_ID = getExtensionId();
const ACTION_PATH = '/api/v1/web/magazine-actions';

let guestConnectionPromise = null;

const emptyForm = () => ({
  id: '',
  slug: '',
  title: '',
  category: '',
  issue: '',
  location: '',
  publicationDate: '',
  summary: '',
  body: '',
  skuRefs: '',
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
    return { 'Content-Type': 'application/json' };
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

async function callMagazineApi(action, method, body) {
  const headers = await getAuthHeaders();
  const url = `${runtimeBaseUrl()}${ACTION_PATH}/${action}`;
  const response = await fetch(url, {
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

function articleMatches(article, search, status) {
  const text = `${article.title || ''} ${article.category || ''} ${article.issue || ''} ${article.location || ''} ${article.slug || ''}`.toLowerCase();
  const matchesSearch = !search || text.includes(search.toLowerCase());
  const visibility = article.visibility || (article.enabled === false ? 'hidden' : 'visible');
  const matchesStatus = status === 'all' || visibility === status;
  return matchesSearch && matchesStatus;
}

function render(root, state) {
  const { articles, selectedId, form, status, error, search, visibility } = state;
  const selectedArticle = articles.find((article) => article.id === selectedId);
  const filtered = articles.filter((article) => articleMatches(article, search, visibility));
  const selectedIds = Object.entries(state.selected).filter(([, value]) => value).map(([id]) => id);

  root.innerHTML = `
    <header>
      <h1>Digital Magazine Editorial Hub</h1>
      <button type="button" class="primary" data-action="refresh">Refresh</button>
    </header>
    ${error ? `<p class="error">${error}</p>` : ''}
    <div class="toolbar">
      <input type="search" name="search" aria-label="Search articles" placeholder="Search title, category, issue..." value="${escapeAttr(search)}" />
      <select name="visibility" aria-label="Status filter">
        <option value="all" ${visibility === 'all' ? 'selected' : ''}>All</option>
        <option value="visible" ${visibility === 'visible' ? 'selected' : ''}>Visible</option>
        <option value="hidden" ${visibility === 'hidden' ? 'selected' : ''}>Hidden</option>
      </select>
      <button type="button" data-action="bulk-enable" ${selectedIds.length ? '' : 'disabled'}>Bulk enable</button>
      <button type="button" data-action="bulk-disable" ${selectedIds.length ? '' : 'disabled'}>Bulk disable</button>
    </div>
    <div class="layout">
      <section class="panel">
        <h2>Articles</h2>
        <ul class="store-list">
          ${
            filtered.length
              ? filtered
                  .map(
                    (article) => `
              <li class="${article.id === selectedId ? 'active' : ''} ${article.enabled === false ? 'disabled' : ''}" data-article-id="${escapeAttr(article.id)}">
                <label class="select-row">
                  <input type="checkbox" data-select-id="${escapeAttr(article.id)}" ${state.selected[article.id] ? 'checked' : ''} />
                </label>
                <strong>${escapeHtml(article.title || article.slug)}</strong>
                <span class="store-meta">${escapeHtml(article.category || 'Uncategorized')}${article.issue ? ` · ${escapeHtml(article.issue)}` : ''}${article.enabled === false ? ' · Hidden' : ''}</span>
              </li>
            `,
                  )
                  .join('')
              : '<li>No articles found.</li>'
          }
        </ul>
      </section>
      <section class="panel">
        <h2>${selectedArticle ? 'Edit Article' : 'Add Article'}</h2>
        <form class="form-grid" data-form="article">
          <label>
            Article ID
            <input name="id" value="${escapeAttr(form.id)}" ${selectedArticle ? 'readonly' : ''} />
          </label>
          <label>
            Slug
            <input name="slug" value="${escapeAttr(form.slug)}" required />
          </label>
          <label>
            Title
            <input name="title" value="${escapeAttr(form.title)}" required />
          </label>
          <label>
            Category
            <input name="category" value="${escapeAttr(form.category)}" />
          </label>
          <label>
            Issue
            <input name="issue" value="${escapeAttr(form.issue)}" />
          </label>
          <label>
            Location
            <input name="location" value="${escapeAttr(form.location)}" />
          </label>
          <label>
            Publication date
            <input name="publicationDate" value="${escapeAttr(form.publicationDate)}" />
          </label>
          <label>
            Related SKUs (comma-separated)
            <input name="skuRefs" value="${escapeAttr(form.skuRefs)}" />
          </label>
          <label>
            Summary
            <textarea name="summary" rows="2">${escapeHtml(form.summary)}</textarea>
          </label>
          <label>
            Body
            <textarea name="body" rows="6">${escapeHtml(form.body)}</textarea>
          </label>
          <label>
            <span>Enabled</span>
            <input type="checkbox" name="enabled" ${form.enabled ? 'checked' : ''} />
          </label>
          <div class="form-actions">
            <button type="submit" class="primary">${selectedArticle ? 'Save Changes' : 'Create Article'}</button>
            <button type="button" data-action="new">New Article</button>
            ${
              selectedArticle
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
  const formElement = root.querySelector('[data-form="article"]');
  const data = new FormData(formElement);
  return {
    id: String(data.get('id') || '').trim(),
    slug: String(data.get('slug') || '').trim(),
    title: String(data.get('title') || '').trim(),
    category: String(data.get('category') || '').trim(),
    issue: String(data.get('issue') || '').trim(),
    location: String(data.get('location') || '').trim(),
    publicationDate: String(data.get('publicationDate') || '').trim(),
    summary: String(data.get('summary') || '').trim(),
    body: String(data.get('body') || '').trim(),
    skuRefs: String(data.get('skuRefs') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    enabled: formElement.querySelector('[name="enabled"]').checked,
  };
}

function articleToForm(article) {
  return {
    id: article.id || '',
    slug: article.slug || '',
    title: article.title || '',
    category: article.category || '',
    issue: article.issue || '',
    location: article.location || '',
    publicationDate: article.publicationDate || '',
    summary: article.summary || '',
    body: article.body || article.content || '',
    skuRefs: Array.isArray(article.skuRefs) ? article.skuRefs.join(', ') : '',
    enabled: article.enabled !== false,
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
    articles: [],
    selectedId: null,
    selected: {},
    form: emptyForm(),
    search: '',
    visibility: 'all',
    status: isUiFrame() ? 'Connecting to Commerce Admin…' : '',
    error: '',
  };

  const update = () => {
    render(root, state);
    bindEvents();
  };

  const loadArticles = async () => {
    state.error = '';
    state.status = 'Loading articles…';
    update();

    try {
      const payload = await callMagazineApi('list-articles', 'GET');
      state.articles = payload.articles || [];
      state.status = `${state.articles.length} article(s) loaded.`;
    } catch (error) {
      state.error = error.message;
      state.status = '';
    }

    update();
  };

  const bindEvents = () => {
    root.querySelector('[data-action="refresh"]')?.addEventListener('click', () => {
      loadArticles();
    });

    root.querySelector('[name="search"]')?.addEventListener('input', (event) => {
      state.search = event.target.value;
      update();
    });

    root.querySelector('[name="visibility"]')?.addEventListener('change', (event) => {
      state.visibility = event.target.value;
      update();
    });

    root.querySelectorAll('[data-select-id]').forEach((element) => {
      element.addEventListener('click', (event) => {
        event.stopPropagation();
      });
      element.addEventListener('change', () => {
        state.selected = { ...state.selected, [element.dataset.selectId]: element.checked };
        update();
      });
    });

    root.querySelectorAll('[data-article-id]').forEach((element) => {
      element.addEventListener('click', () => {
        const article = state.articles.find((item) => item.id === element.dataset.articleId);
        if (!article) return;
        state.selectedId = article.id;
        state.form = articleToForm(article);
        state.status = `Editing ${article.title || article.slug}.`;
        update();
      });
    });

    const bulkToggle = async (mode) => {
      const ids = Object.entries(state.selected)
        .filter(([, value]) => value)
        .map(([id]) => id);
      if (!ids.length) return;
      try {
        await callMagazineApi('bulk-toggle-articles', 'POST', { ids, mode });
        state.selected = {};
        state.status = `Updated ${ids.length} article(s).`;
        await loadArticles();
      } catch (error) {
        state.error = error.message;
        update();
      }
    };

    root.querySelector('[data-action="bulk-enable"]')?.addEventListener('click', () => bulkToggle('enable'));
    root.querySelector('[data-action="bulk-disable"]')?.addEventListener('click', () => bulkToggle('disable'));

    root.querySelector('[data-action="new"]')?.addEventListener('click', () => {
      state.selectedId = null;
      state.form = emptyForm();
      state.status = 'Creating a new article.';
      update();
    });

    root.querySelector('[data-action="delete"]')?.addEventListener('click', async () => {
      if (!state.selectedId || !window.confirm(`Delete article ${state.selectedId}?`)) {
        return;
      }

      try {
        await callMagazineApi('delete-article', 'POST', { id: state.selectedId });
        state.selectedId = null;
        state.form = emptyForm();
        state.status = 'Article deleted.';
        await loadArticles();
      } catch (error) {
        state.error = error.message;
        update();
      }
    });

    root.querySelector('[data-form="article"]')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = readForm(root);

      try {
        if (state.selectedId) {
          await callMagazineApi('update-article', 'POST', payload);
          state.status = `Saved ${payload.title}.`;
        } else {
          await callMagazineApi('create-article', 'POST', payload);
          state.selectedId = payload.id || payload.slug;
          state.status = `Created ${payload.title}.`;
        }

        await loadArticles();
        const refreshed = state.articles.find((article) => article.id === state.selectedId);
        if (refreshed) {
          state.form = articleToForm(refreshed);
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

  await loadArticles();
}

bootstrap().catch((error) => {
  const root = document.getElementById('root');
  root.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
});
