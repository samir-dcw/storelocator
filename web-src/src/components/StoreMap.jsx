import React from 'react';

export default function StoreMap({ stores = [] }) {
  return <div data-testid="store-map">Map with {stores.length} stores</div>;
}
