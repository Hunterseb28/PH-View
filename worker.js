/**
 * PH-View — Cloudflare Worker
 * Proxy for Pornhub's Webmaster search endpoint.
 *
 * Deploy this file as a Cloudflare Worker, then set its URL in index.html.
 * Only video search is enabled here. No scraping fallback is used.
 */
const ALLOWED_ORIGIN = "https://hunterseb28.github.io";
const API_BASE = "https://www.pornhub.com/webmasters/search";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=120"
    }
  });
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);
    if (request.method !== "GET" || url.pathname !== "/search") {
      return json({ error: "Route introuvable." }, 404, origin);
    }
    if (origin !== ALLOWED_ORIGIN) {
      return json({ error: "Origine non autorisée." }, 403, origin);
    }

    const query = (url.searchParams.get("q") || "").trim().slice(0, 100);
    const page = Math.max(1, Math.min(10, Number(url.searchParams.get("page") || 1)));
    const orderMap = {
      relevance: "featured",
      recent: "newest",
      popular: "mostviewed",
      rated: "rating"
    };
    const order = orderMap[url.searchParams.get("sort")] || "featured";

    if (query.length < 2) {
      return json({ error: "Entre au moins 2 caractères." }, 400, origin);
    }

    const upstream = new URL(API_BASE);
    upstream.searchParams.set("search", query);
    upstream.searchParams.set("page", String(page));
    upstream.searchParams.set("ordering", order);
    upstream.searchParams.set("thumbsize", "medium");

    try {
      const response = await fetch(upstream.toString(), {
        headers: {
          "Accept": "application/json",
          "User-Agent": "PH-View/1.0 (search integration)"
        }
      });
      if (!response.ok) {
        return json({ error: "La source de recherche a répondu " + response.status + "." }, 502, origin);
      }

      const payload = await response.json();
      const rows = Array.isArray(payload.videos) ? payload.videos : [];
      const videos = rows.map((item) => {
        const link = typeof item.url === "string" ? item.url : "";
        let safeUrl = "";
        let safeThumb = "";
        try {
          const parsed = new URL(link);
          if (parsed.hostname === "www.pornhub.com" && parsed.protocol === "https:") safeUrl = parsed.toString();
        } catch (_) {}
        const thumb = item.thumb || item.default_thumb || item.preview || "";
        try {
          const parsedThumb = new URL(thumb);
          if (parsedThumb.protocol === "https:" && /(^|\\.)phncdn\\.com$/.test(parsedThumb.hostname)) safeThumb = parsedThumb.toString();
        } catch (_) {}
        return {
          title: String(item.title || "Vidéo sans titre").slice(0, 240),
          url: safeUrl,
          thumbnail: safeThumb,
          duration: String(item.duration || ""),
          views: String(item.views || "")
        };
      }).filter((item) => item.url);

      return json({ videos, page, hasResults: videos.length > 0 }, 200, origin);
    } catch (error) {
      return json({ error: "Impossible de joindre la source pour le moment." }, 502, origin);
    }
  }
};
