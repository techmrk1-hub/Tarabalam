// Script conversion only. This is not semantic language translation.
// Results are cached in script_renderings.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const db = createClient(SUPABASE_URL, SERVICE_KEY);
const ENDPOINT = 'https://aksharamukha-plugin.appspot.com/api/public';
const allowedTargets = new Set(['Devanagari', 'Telugu', 'Kannada', 'Tamil', 'IAST']);

async function sha256(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors() });
  if (req.method !== 'POST') return json({ error: 'POST required' }, 405);
  try {
    const body = await req.json();
    const text = String(body.text || '');
    const source = String(body.source || 'Telugu');
    const target = String(body.target || '');
    const nativize = body.nativize === true;
    if (!text.trim() || !allowedTargets.has(target)) {
      return json({ error: 'text and a supported target are required' }, 400);
    }
    if (source === target) return json({ text, cached: false });
    const sourceHash = await sha256(text);

    const { data: cached } = await db.from('script_renderings')
      .select('rendered_text')
      .eq('source_script', source)
      .eq('target_script', target)
      .eq('source_hash', sourceHash)
      .eq('nativize', nativize)
      .maybeSingle();
    if (cached?.rendered_text) return json({ text: cached.rendered_text, cached: true });

    const params = new URLSearchParams({
      source,
      target,
      text,
      nativize: String(nativize)
    });
    // Article prose asks for nativize. Tamil still prints phonetic
    // superscripts until these post-options run. Sutra text sends
    // nativize false and keeps the scholarly markers.
    if (nativize && target === 'Tamil') {
      params.set('postoptions', 'TamilRemoveNumbers,TamilRemoveApostrophe');
    }
    const response = await fetch(`${ENDPOINT}?${params.toString()}`);
    if (!response.ok) throw new Error('SCRIPT_PROVIDER_FAILED');
    const rendered = await response.text();
    if (!rendered.trim()) throw new Error('SCRIPT_PROVIDER_FAILED');
    await db.from('script_renderings').upsert({
      source_script: source,
      target_script: target,
      source_hash: sourceHash,
      source_text: text,
      rendered_text: rendered,
      nativize,
      updated_at: new Date().toISOString()
    }, { onConflict: 'source_script,target_script,source_hash,nativize' });
    return json({ text: rendered, cached: false });
  } catch {
    return json({ error: 'Script conversion is unavailable' }, 502);
  }
});

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
