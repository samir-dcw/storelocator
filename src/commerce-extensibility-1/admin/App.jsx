import React, { useMemo, useState } from 'react';

const sample = [];

export default function App() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const rows = useMemo(() => sample.filter((row) => (status === 'all' ? true : row.status === status)), [status]);
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Blog / Article Admin</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input aria-label="Search articles" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, category, issue..." />
        <select aria-label="Status filter" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>
      <section aria-label="Article grid">{rows.length ? 'Rows' : 'No articles loaded yet.'}</section>
    </main>
  );
}
