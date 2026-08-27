import React from 'react';

export default function StoreList({ stores = [], onSelect }) {
  return (
    <ul>
      {stores.map((store) => (
        <li key={store.id}>
          <button onClick={() => onSelect?.(store)}>{store.name}</button>
        </li>
      ))}
    </ul>
  );
}
