// Reads a public Google Doc and returns cleaned article HTML.
// The canonical document is never written. Script conversion happens later.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { cleanDocHtml } from './clean-doc.mjs';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const db = createClient(SUPABASE_URL, SERVICE_KEY);
const FRESH_MS = 15 * 60 * 1000;
const CLEANER_VERSION = '2';
const MAX_HTML = 1_500_000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors() });
  if (req.method !== 'POST') return json({ error: 'POST required' }, 405);
  try {
    const body = await req.json();
    const docId = documentId(body.google_doc_url);
    const articleId = articleKey(body.article_id);
    if (!docId) return json({ error: 'A public Google Doc is required' }, 400);

    const { data: cached } = await db.from('article_doc_sources')
      .select('html, content_hash, fetched_at, cleaner_version')
      .eq('doc_id', docId)
      .maybeSingle();
    if (cached?.html && cached.cleaner_version === CLEANER_VERSION && Date.now() - Date.parse(cached.fetched_at) < FRESH_MS) {
      return json({ html: cached.html, content_hash: cached.content_hash, doc_id: docId, cached: true });
    }

    const response = await fetch(`https://docs.google.com/document/d/${docId}/export?format=html`, {
      headers: { accept: 'text/html' },
      redirect: 'follow'
    });
    if (!response.ok) return json({ error: 'Article text is unavailable' }, 502);
    const raw = await response.text();
    if (!raw || raw.length > MAX_HTML || !/<body[\s>]/i.test(raw)) {
      return json({ error: 'Article text is unavailable' }, 502);
    }
    const html = cleanDocHtml(raw);
    if (!html.trim()) return json({ error: 'Article text is unavailable' }, 502);
    const contentHash = await sha256(html);
    await db.from('article_doc_sources').upsert({
      doc_id: docId,
      article_id: articleId,
      content_hash: contentHash,
      html,
      cleaner_version: CLEANER_VERSION,
      fetched_at: new Date().toISOString()
    }, { onConflict: 'doc_id' });
    return json({ html, content_hash: contentHash, doc_id: docId, cached: false });
  } catch {
    return json({ error: 'Article text is unavailable' }, 502);
  }
});

function documentId(value) {
  const match = String(value || '').match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  const id = match?.[1] || '';
  return /^[a-zA-Z0-9_-]{8,}$/.test(id) ? id : '';
}

function articleKey(value) {
  const id = String(value || '').trim();
  return /^[A-Za-z0-9_-]{1,80}$/.test(id) ? id : '';
}

async function sha256(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function cors() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type'
  };
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...cors(), 'content-type': 'application/json; charset=utf-8' }
  });
}
