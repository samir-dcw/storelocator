import React, { useEffect, useMemo, useState } from 'react';
import { PreferredStoreProvider, usePreferredStore } from '../context/PreferredStoreContext.jsx';
import StoreList from './StoreList.jsx';
import StoreMap from './StoreMap.jsx';
import StoreDetails from './StoreDetails.jsx';
import AmenityFilters from './AmenityFilters.jsx';

const RADIUS_OPTIONS = [5, 10, 25, 50];

function StoreLocatorInner({ getStoresUrl, checkStockUrl }) {
  const { preferredStore, setPreferredStore } = usePreferredStore();
  const [locationType, setLocationType] = useState('geolocation');
  const [zip, setZip] = useState('');
  const [coords, setCoords] = useState(null);
  const [locationMessage, setLocationMessage] = useState('Requesting your current location...');
  const [stores, setStores] = useState([]);
  const [radius, setRadius] = useState(25);
  const [sourceCode, setSourceCode] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const amenities = useMemo(() => [...new Set(stores.flatMap((store) => store.amenities || []))], [stores]);

  function requestCurrentLocation() {
    setLocationMessage('Requesting your current location...');
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationMessage('Your current location is ready. Click Search to find nearby stores.');
        setError('');
      },
      () => {
        setCoords(null);
        setLocationMessage('Unable to get your current location. Try again or enter a zip code manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  useEffect(() => {
    if (locationType === 'geolocation') {
      requestCurrentLocation();
    }
  }, [locationType]);

  const filteredStores = useMemo(() => stores.filter((store) => selectedAmenities.length === 0
    || selectedAmenities.every((amenity) => (store.amenities || []).includes(amenity))), [stores, selectedAmenities]);

  async function search() {
    setLoading(true);
    setError('');

    const payload = {
      location_type: locationType,
      radius,
      unit: 'mi',
    };

    if (sourceCode.trim()) payload.source_code = sourceCode.trim();
    if (businessName.trim()) payload.name = businessName.trim();

    if (locationType === 'zip') {
      if (!zip.trim()) {
        setError('Please enter a zip code.');
        setLoading(false);
        return;
      }
      payload.zip = zip.trim();
    } else if (!coords) {
      setError('Current location is not available. Try again or enter a zip code manually.');
      setLoading(false);
      return;
    } else {
      payload.lat = coords.lat;
      payload.lng = coords.lng;
    }

    try {
      const response = await fetch(getStoresUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        setStores([]);
        setError(body.error || 'Unable to get stores');
        return;
      }
      setStores(body.stores || []);
      if ((body.stores || []).length === 0) {
        setError('No locations nearby.');
      }
    } catch {
      setStores([]);
      setError('Unable to get stores');
    } finally {
      setLoading(false);
    }
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
        Professional Code
        <input value={sourceCode} onChange={(e) => setSourceCode(e.target.value)} placeholder="Enter professional code" />
      </label>
      <label>
        Business Name
        <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Enter business name" />
      </label>
      <label>
        Location
        <select value={locationType} onChange={(e) => setLocationType(e.target.value)}>
          <option value="geolocation">Use my current location</option>
          <option value="zip">Manually enter my zip code</option>
        </select>
      </label>
      {locationType === 'zip' ? (
        <label>
          Zip Code
          <input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="Enter zip code" />
        </label>
      ) : (
        <div>
          <p>{locationMessage}</p>
          <button type="button" onClick={requestCurrentLocation}>Try Again</button>
        </div>
      )}
      <label>
        Search Radius
        <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
          {RADIUS_OPTIONS.map((value) => (
            <option key={value} value={value}>{value} Miles</option>
          ))}
        </select>
      </label>
      <button onClick={search} disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
      {error && <p>{error}</p>}
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
