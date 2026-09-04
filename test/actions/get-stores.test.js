import assert from 'node:assert/strict';
import { main } from '../../src/commerce-extensibility-1/actions/get-stores/index.js';

describe('get-stores', () => {
  it('returns sorted stores from cached state', async () => {
    globalThis.__storeLocatorMemoryState = new Map();
    globalThis.__storeLocatorMemoryState.set('store-locator:store-locations', {
      value: [
        { id: '2', name: 'Far', latitude: 40, longitude: -75 },
        { id: '1', name: 'Near', latitude: 41, longitude: -75 },
      ],
      expiresAt: null,
    });

    const result = await main({ query: { lat: 41, lng: -75, radius: 500, unit: 'mi' } });
    const body = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(body.stores[0].name, 'Near');
  });

  it('returns disabled when store locator is off', async () => {
    const result = await main({ enable_store_locator: false });
    const body = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(body.enabled, false);
  });

  it('rejects requests without a location', async () => {
    const result = await main({ query: {} });
    assert.equal(result.statusCode, 400);
  });

  it('filters by source_code and business name', async () => {
    globalThis.__storeLocatorMemoryState = new Map();
    globalThis.__storeLocatorMemoryState.set('store-locator:store-locations', {
      value: [
        { id: '1', name: 'Samir Bhayani', source_code: 'testtest', latitude: 40.71, longitude: -74.01, enabled: true },
        { id: '2', name: 'Other Store', source_code: 'other', latitude: 40.72, longitude: -74.02, enabled: true },
      ],
      expiresAt: null,
    });

    const result = await main({
      lat: 40.7,
      lng: -74.0,
      radius: 25,
      unit: 'mi',
      source_code: 'testtest',
      name: 'Samir',
    });
    const body = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(body.stores.length, 1);
    assert.equal(body.stores[0].name, 'Samir Bhayani');
  });

  it('rejects manual zip search without a zip code', async () => {
    const result = await main({ location_type: 'zip' });
    const body = JSON.parse(result.body);
    assert.equal(result.statusCode, 400);
    assert.match(body.error, /zip is required/i);
  });

  it('rejects geolocation search without coordinates', async () => {
    const result = await main({ location_type: 'geolocation' });
    const body = JSON.parse(result.body);
    assert.equal(result.statusCode, 400);
    assert.match(body.error, /lat and lng/i);
  });

  it('accepts zip aliases on the action root', async () => {
    globalThis.__storeLocatorMemoryState = new Map();
    globalThis.__storeLocatorMemoryState.set('store-locator:store-locations', {
      value: [{ id: '1', name: 'Downtown', latitude: 40.71, longitude: -74.01 }],
      expiresAt: null,
    });

    const result = await main({
      location_type: 'geolocation',
      lat: 40.7,
      lng: -74.0,
      zipcode: '10001',
      radius: 25,
      unit: 'mi',
    });
    const body = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(body.origin.locationSource, 'geolocation');
  });

  it('accepts GET query params on the action root', async () => {
    globalThis.__storeLocatorMemoryState = new Map();
    globalThis.__storeLocatorMemoryState.set('store-locator:store-locations', {
      value: [{ id: '1', name: 'Downtown', latitude: 40.71, longitude: -74.01 }],
      expiresAt: null,
    });

    const result = await main({ lat: 40.7, lng: -74.0, radius: 25, unit: 'mi' });
    const body = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(body.enabled, true);
    assert.equal(body.stores.length, 1);
  });
});
