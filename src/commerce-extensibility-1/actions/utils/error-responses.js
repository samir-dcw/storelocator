function baseResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  };
}

export function jsonResponse(statusCode, body) {
  return baseResponse(statusCode, body);
}

export function badRequest(message, details) {
  return baseResponse(400, { error: message, details });
}

export function forbidden(message, details) {
  return baseResponse(403, { error: message, details });
}

export function serverError(message, details) {
  return baseResponse(500, { error: message, details });
}
