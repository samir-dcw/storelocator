import React from 'react';

export default function AmenityFilters({ amenities = [], selected = [], onChange }) {
  return (
    <div>
      {amenities.map((amenity) => (
        <label key={amenity}>
          <input
            type="checkbox"
            checked={selected.includes(amenity)}
            onChange={(event) => onChange?.(amenity, event.target.checked)}
          />
          {amenity}
        </label>
      ))}
    </div>
  );
}
