/* ==========================================================================
   API — le "téléphone" vers le backend. Un seul endroit parle au réseau.
   ========================================================================== */

import { CONFIG } from "./config.js";

export class ApiError extends Error {
  constructor(status, path, message) {
    super(message);
    this.status = status;
    this.path = path;
  }
}

/* Construit l'adresse complète et ajoute toujours ?candidat_slug=... */
function buildUrl(path, params = {}) {
  const url = new URL(path, CONFIG.apiUrl);
  url.searchParams.set("candidat_slug", CONFIG.candidatSlug);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  }
  return url;
}

async function request(method, path, { params, body, apiKey } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (apiKey) headers["X-API-Key"] = apiKey;

  let response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, path, "API injoignable. Lance le backend avec « just dev ».");
  }

  if (!response.ok) {
    let detail = `Erreur ${response.status}`;
    try {
      const data = await response.json();
      if (typeof data.detail === "string") detail = data.detail;
      else if (Array.isArray(data.detail)) detail = data.detail.map((d) => d.msg).join(" · ");
    } catch { /* corps vide ou non JSON */ }
    throw new ApiError(response.status, path, detail);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const get = (path, params) => request("GET", path, { params });
export const post = (path, body, apiKey) => request("POST", path, { body, apiKey });
export const del = (path, apiKey) => request("DELETE", path, { apiKey });
