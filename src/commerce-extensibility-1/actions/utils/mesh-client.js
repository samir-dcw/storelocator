const RETRYABLE_STATUS = new Set([502, 503, 504]);

async function fetchWithRetry(url, options, retries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (!RETRYABLE_STATUS.has(response.status)) return response;
      lastError = new Error(`Transient upstream error (${response.status})`);
    } catch (error) {
      lastError = error;
      if (error && error.code !== 'ETIMEDOUT' && error.name !== 'FetchError') break;
    }
    if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 150 * 2 ** attempt));
  }
  throw lastError;
}

export async function queryMesh(endpoint, query, variables = {}, headers = {}) {
  const response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const error = new Error(`Mesh request failed with ${response.status}`);
    error.statusCode = response.status;
    error.body = text;
    throw error;
  }

  const body = await response.json();
  if (body.errors && body.errors.length) {
    const error = new Error(body.errors[0].message || 'Mesh returned errors');
    error.statusCode = 502;
    error.errors = body.errors;
    throw error;
  }

  return body.data;
}
