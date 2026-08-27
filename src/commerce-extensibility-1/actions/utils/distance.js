const EARTH_RADIUS_KM = 6371;
const KM_TO_MILES = 0.621371;

export function haversineDistance(origin, destination, unit = 'mi') {
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(destination.lat - origin.lat);
  const dLng = toRad(destination.lng - origin.lng);
  const lat1 = toRad(origin.lat);
  const lat2 = toRad(destination.lat);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = EARTH_RADIUS_KM * c;
  return unit === 'km' ? km : km * KM_TO_MILES;
}

export function withinRadius(distance, radius) {
  if (radius == null || radius === '') return true;
  return Number(distance) <= Number(radius);
}
