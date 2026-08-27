export function createGeocodeClient(params = {}, logger = console) {
  const apiKey = params.MAPS_API_KEY || process.env.MAPS_API_KEY;

  async function geocode(address) {
    if (!apiKey) {
      throw new Error('MAPS_API_KEY is required');
    }

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', address);
    url.searchParams.set('key', apiKey);

    const response = await fetch(url);
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.status !== 'OK' || !body.results?.length) {
      throw new Error(body.error_message || `Geocode failed for ${address}`);
    }

    const result = body.results[0];
    const location = result.geometry.location;
    logger.info?.('geocode.success', { address });
    return {
      lat: location.lat,
      lng: location.lng,
      formattedAddress: result.formatted_address,
    };
  }

  return { geocode };
}
