function isMagazineAdmin() {
  const haystack = `${window.location.href} ${document.referrer} ${window.name}`;
  return /editorial_hub|digital[_-]magazine/i.test(haystack);
}

const root = document.getElementById('root');
const loading = root?.querySelector('.loading');

if (isMagazineAdmin()) {
  document.title = 'Digital Magazine Editorial Hub';
  if (loading) {
    loading.textContent = 'Loading Digital Magazine admin…';
  }
  import('./magazine-admin.js');
} else {
  document.title = 'Store Locator Admin';
  if (loading) {
    loading.textContent = 'Loading Store Locator admin…';
  }
  import('./store-locator-admin.js');
}
