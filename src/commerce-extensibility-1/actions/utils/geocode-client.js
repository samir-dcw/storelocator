function parseUsZip(value) {
  const match = String(value).trim().match(/^(\d{5})(?:-\d{4})?$/);
  return match ? match[1] : null;
}

function parseIndiaPin(value) {
  const match = String(value).trim().match(/^(\d{6})$/);
  return match ? match[1] : null;
}

async function geocodeWithZippopotam(countryCode, postalCode) {
  const response = await fetch(`https://api.zippopotam.us/${countryCode}/${postalCode}`);
  if (!response.ok) {
    return null;
  }

  const body = await response.json();
  const place = body.places?.[0];
  if (!place) {
    return null;
  }

  return {
    lat: Number(place.latitude),
    lng: Number(place.longitude),
    formattedAddress: `${body['post code']} ${place['place name']}, ${place.state || place['state abbreviation'] || countryCode.toUpperCase()}`,
  };
}

async function geocodeWithNominatim(postalCode) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('postalcode', postalCode);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  const response = await fetch(url, {
    headers: { 'User-Agent': 'AdobeCommerceStoreLocator/1.0 (zip-search)' },
  });
  if (!response.ok) {
    return null;
  }

  const results = await response.json();
  const result = results?.[0];
  if (!result) {
    return null;
  }

  return {
    lat: Number(result.lat),
    lng: Number(result.lon),
    formattedAddress: result.display_name,
  };
}

async function geocodePostalCodeFallback(postalCode, logger) {
  const usZip = parseUsZip(postalCode);
  if (usZip) {
    const result = await geocodeWithZippopotam('us', usZip);
    if (result) {
      logger.info?.('geocode.zip.fallback', { provider: 'zippopotam', country: 'us', postalCode: usZip });
      return result;
    }
  }

  const indiaPin = parseIndiaPin(postalCode);
  if (indiaPin) {
    const result = await geocodeWithZippopotam('in', indiaPin);
    if (result) {
      logger.info?.('geocode.zip.fallback', { provider: 'zippopotam', country: 'in', postalCode: indiaPin });
      return result;
    }
  }

  const nominatimResult = await geocodeWithNominatim(String(postalCode).trim());
  if (nominatimResult) {
    logger.info?.('geocode.zip.fallback', { provider: 'nominatim', postalCode });
    return nominatimResult;
  }

  throw new Error(`Geocode failed for zip ${postalCode}`);
}

export function createGeocodeClient(params = {}, logger = console) {
  const apiKey = params.MAPS_API_KEY || process.env.MAPS_API_KEY;

  async function geocodeWithGoogle(address) {
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
    logger.info?.('geocode.success', { address, provider: 'google' });
    return {
      lat: location.lat,
      lng: location.lng,
      formattedAddress: result.formatted_address,
    };
  }

  async function geocode(address) {
    const query = String(address || '').trim();
    if (!query) {
      throw new Error('Address or zip is required');
    }

    const looksLikePostalCode = parseUsZip(query) || parseIndiaPin(query) || /^\d{4,10}$/.test(query);

    if (looksLikePostalCode) {
      if (apiKey) {
        try {
          return await geocodeWithGoogle(query);
        } catch (error) {
          logger.warn?.('geocode.google.fallback', { query, error: error.message });
        }
      }
      return geocodePostalCodeFallback(query, logger);
    }

    if (apiKey) {
      return geocodeWithGoogle(query);
    }

    throw new Error('MAPS_API_KEY is required for address and city search');
  }

  return { geocode };
}
