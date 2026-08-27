import { cacheKey, getJson, putJson } from '../utils/state-cache.js';

export async function main(params) {
  try {
    const product = normalize(params);
    const key = cacheKey(params.IO_STATE_KEY || 'magazine', `product:${product.id}`);
    const existing = await getJson(key, 'magazine');
    const payload = { ...product, updatedAt: new Date().toISOString() };
    if (existing && JSON.stringify(existing) === JSON.stringify(payload)) {
      return reply(200, { updated: false, id: product.id });
    }
    await putJson(key, payload, 'magazine');
    return reply(200, { updated: true, id: product.id });
  } catch (error) {
    return reply(error.statusCode || 500, { error: error.message || 'Product sync failed' });
  }
}

function normalize(params) {
  if (!params || !params.id) {
    const error = new Error('Missing product id');
    error.statusCode = 400;
    throw error;
  }
  return {
    id: String(params.id),
    name: params.name || '',
    price: Number(params.price || 0),
    salable: Boolean(params.salable),
    media_gallery_images: Array.isArray(params.media_gallery_images) ? params.media_gallery_images : [],
  };
}

function reply(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}
