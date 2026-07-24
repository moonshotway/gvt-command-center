// GVT Command Center — shared state API (Netlify Function + Netlify Blobs).
// Auth: shared secret in GVT_ACCESS_KEY env var, sent by the client as x-gvt-key.
// Until the env var is set in the Netlify dashboard, this returns 503 and the
// app runs in local-only mode — sync is opt-in, never a hard dependency.
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const key = process.env.GVT_ACCESS_KEY;
  if (!key) {
    return Response.json({ configured: false, error: "GVT_ACCESS_KEY not set in Netlify environment" }, { status: 503 });
  }
  if (req.headers.get("x-gvt-key") !== key) {
    return Response.json({ configured: true, error: "unauthorized" }, { status: 401 });
  }

  const store = getStore("gvt-state");

  if (req.method === "GET") {
    const state = await store.get("state", { type: "json" });
    return Response.json({ configured: true, state: state ?? null });
  }

  if (req.method === "PUT" || req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { body = null; }
    if (!body || typeof body !== "object" || !body.updatedAt || body.schema !== 2) {
      return Response.json({ error: "invalid state payload" }, { status: 400 });
    }
    await store.setJSON("state", body);
    return Response.json({ ok: true, updatedAt: body.updatedAt });
  }

  return Response.json({ error: "method not allowed" }, { status: 405 });
};

export const config = { path: "/api/state" };
