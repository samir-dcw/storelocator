import { usePreferredStoreContext } from '../context/PreferredStoreContext.jsx';

export function usePreferredStore() {
  return usePreferredStoreContext();
}
