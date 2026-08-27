import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const PreferredStoreContext = createContext(null);
const STORAGE_KEY = 'preferred-store';

function safeStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readCookie() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((item) => item.startsWith(`${STORAGE_KEY}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

function writeCookie(value) {
  if (typeof document === 'undefined') return;
  document.cookie = `${STORAGE_KEY}=${encodeURIComponent(value)}; path=/; max-age=604800`;
}

export function PreferredStoreProvider({ children }) {
  const [preferredStore, setPreferredStore] = useState(null);

  useEffect(() => {
    const storage = safeStorage();
    const raw = storage?.getItem(STORAGE_KEY) || readCookie();
    if (raw) {
      try {
        setPreferredStore(JSON.parse(raw));
      } catch {
        setPreferredStore(null);
      }
    }
  }, []);

  const updatePreferredStore = useCallback((store) => {
    setPreferredStore(store);
    const raw = JSON.stringify(store);
    const storage = safeStorage();
    try {
      storage?.setItem(STORAGE_KEY, raw);
    } catch {
      writeCookie(raw);
    }
  }, []);

  const value = useMemo(() => ({ preferredStore, setPreferredStore: updatePreferredStore }), [preferredStore, updatePreferredStore]);

  return <PreferredStoreContext.Provider value={value}>{children}</PreferredStoreContext.Provider>;
}

export function usePreferredStoreContext() {
  const context = useContext(PreferredStoreContext);
  if (!context) {
    throw new Error('usePreferredStoreContext must be used within PreferredStoreProvider');
  }
  return context;
}
