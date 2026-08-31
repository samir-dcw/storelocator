import React, { useEffect, useMemo, useState } from 'react';

const emptyForm = {
  id: '',
  slug: '',
  title: '',
  category: '',
  issue: '',
  location: '',
  publicationDate: '',
  enabled: true,
  summary: '',
  body: '',
  skuRefs: '',
};

function h(tag, props, ...children) {
  return React.createElement(tag, props, ...children);
}

function rowMatches(row, search) {
  const text = `${row.title || ''} ${row.category || ''} ${row.issue || ''} ${row.location || ''} ${row.slug || ''}`.toLowerCase();
  return text.includes(search.toLowerCase());
}

async function loadArticles() {
  const response = await fetch('/api/get-magazine-articles');
  if (!response.ok) throw new Error('Failed to load articles');
  return response.json();
}

export default function App() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    loadArticles().then((data) => setArticles(data.articles || [])).catch((err) => setError(err.message));
  }, []);

  const filtered = useMemo(() => articles.filter((row) => rowMatches(row, search) && (status === 'all' ? true : row.visibility === status)), [articles, search, status]);
  const selectedIds = Object.entries(selected).filter(([, value]) => value).map(([id]) => id);

  return h(
    'main',
    { style: { padding: 24, fontFamily: 'system-ui, sans-serif' } },
    h('h1', null, 'Blog / Article Admin'),
    error ? h('div', { role: 'alert' }, error) : null,
    h(
      'div',
      { style: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' } },
      h('input', { 'aria-label': 'Search articles', value: search, onChange: (e) => setSearch(e.target.value), placeholder: 'Search title, category, issue...' }),
      h('select', { 'aria-label': 'Status filter', value: status, onChange: (e) => setStatus(e.target.value) }, h('option', { value: 'all' }, 'All'), h('option', { value: 'visible' }, 'Visible'), h('option', { value: 'hidden' }, 'Hidden')),
      h('button', { type: 'button' }, 'Bulk enable'),
      h('button', { type: 'button' }, 'Bulk disable'),
    ),
    h(
      'section',
      { 'aria-label': 'Article grid' },
      filtered.length
        ? filtered.map((row) => h('article', { key: row.id }, h('input', { type: 'checkbox', checked: Boolean(selected[row.id]), onChange: () => setSelected({ ...selected, [row.id]: !selected[row.id] }) }), h('strong', null, row.title || row.slug), h('span', null, ` • ${row.category || ''}`)))
        : 'No articles loaded yet.',
    ),
    h('p', null, `Selected: ${selectedIds.length}`),
    h(
      'section',
      { 'aria-label': 'Article form' },
      Object.keys(form).map((key) => h('label', { key, style: { display: 'block', marginTop: 8 } }, key, h('input', { value: String(form[key]), onChange: (e) => setForm({ ...form, [key]: e.target.value }) }))),
    ),
  );
}
