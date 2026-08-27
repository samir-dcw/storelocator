import React, { useEffect, useMemo, useState } from 'react';
import { PreferredStoreProvider, usePreferredStore } from '../context/PreferredStoreContext.jsx';
import StoreList from './StoreList.jsx';
import StoreMap from './StoreMap.jsx';
import StoreDetails from './StoreDetails.jsx';
import AmenityFilters from './AmenityFilters.jsx';

function StoreLocatorInner({ getStoresUrl, checkStockUrl }) {
  const { preferredStore, setPreferredStore } = usePreferredStore();
  const [query, setQuery] = useState('');
  const [stores, setStores] = useState([]);
  const [radius, setRadius] = useState(25);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selected, setSelected] = useState(null);
  const amenities = useMemo(() => [...new Set(stores.flatMap((store) => store.amenities || []))], [stores]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition?.((pos) => {
      setQuery(`${pos.coords.latitude},${pos.coords.longitude}`);
    });
  }, []);

  const filteredStores = useMemo(() => stores.filter((store) => selectedAmenities.length === 0
    || selectedAmenities.every((amenity) => (store.amenities || []).includes(amenity))), [stores, selectedAmenities]);

  async function search() {
    const response = await fetch(getStoresUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ address: query, radius }),
    });
    const body = await response.json();
    setStores(body.stores || []);
  }

  async function loadStock(store) {
    const response = await fetch(checkStockUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sku: 'sample-sku', source_code: store.source_code || store.id }),
    });
    const body = await response.json();
    setSelected({ ...store, stock: body.stock });
  }

  return (
    <div>
      <h2>Store Locator</h2>
      <label>
        ZIP / City
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ZIP, city, or coordinates" />
      </label>
      <label>
        Radius
        <input type="number" value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
      </label>
      <button onClick={search}>Search</button>
      <AmenityFilters amenities={amenities} selected={selectedAmenities} onChange={(amenity, checked) => setSelectedAmenities((current) => (checked ? [...current, amenity] : current.filter((value) => value !== amenity)))} />
      <StoreMap stores={filteredStores} />
      <StoreList stores={filteredStores} onSelect={(store) => { setSelected(store); loadStock(store); }} />
      <div>
        {filteredStores.map((store) => (
          <article key={store.id}>
            <h3>{store.name}</h3>
            <div>{store.distance} {store.distance != null ? 'mi' : ''}</div>
            <button onClick={() => setPreferredStore(store)}>Set preferred store</button>
          </article>
        ))}
      </div>
      <StoreDetails store={selected} />
      {preferredStore && <div>Preferred store: {preferredStore.name}</div>}
    </div>
  );
}

export default function StoreLocator(props) {
  return <PreferredStoreProvider><StoreLocatorInner {...props} /></PreferredStoreProvider>;
}
