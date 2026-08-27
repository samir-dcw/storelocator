import React from 'react';

export default function StoreDetails({ store }) {
  if (!store) return null;
  return (
    <section>
      <h3>{store.name}</h3>
      <p>{store.hours}</p>
      <p>{store.phone}</p>
      <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address || store.name)}`}>Directions</a>
      <div>{(store.amenities || []).join(', ')}</div>
    </section>
  );
}
