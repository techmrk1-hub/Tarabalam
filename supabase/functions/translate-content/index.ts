// Generates draft translations only. A machine translation is never Verified or published.
// Secrets (Supabase Edge Function secrets, never the browser):
//   GOOGLE_TRANSLATE_API_KEY
//   GOOGLE_CLOUD_PROJECT_ID
//   GOOGLE_TRANSLATION_LOCATION   (default us-central1)
//   GOOGLE_TRANSLATION_MODEL      (default general/translation-llm)
//   TRANSLATION_ADMIN_SECRET

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  TARGETS,
  sourceHash,
  prepareFields,
  rebuildFields,
  translationRequestBody,
  textsFromProvider,
  reviewPatch,
  chunk
} from './content-protect.mjs';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ADMIN_SECRET = Deno.env.get('TRANSLATION_ADMIN_SECRET') ?? '';
const db = createClient(SUPABASE_URL, SERVICE_KEY);
const PROVIDER = 'google-translation-llm';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors() });
  if (req.method !== 'POST') return json({ error: 'POST required' }, 405);
  if (!ADMIN_SECRET || req.headers.get('x-admin-secret') !== ADMIN_SECRET) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await req.json();
    const action = String(body.action || 'generate');
    if (action === 'status') return await status(body);
    if (action === 'review') return await review(body);
    if (action === 'list-terms') return await listTerms();
    if (action === 'save-term') return await saveTerm(body);
    if (action === 'generate') return await generate(body);
    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    const statusCode = Number(error?.status) || 500;
    const message = statusCode === 500 ? 'Translation request failed' : String(error?.message || 'Request failed');
    return json({ error: message }, statusCode);
  }
});

async function generate(body) {
  const entityType = String(body.entity_type || '').trim();
  const entityId = String(body.entity_id || '').trim();
  const sourceFields = body.source_fields && typeof body.source_fields === 'object' && !Array.isArray(body.source_fields)
    ? body.source_fields
    : null;
  const targets = Array.isArray(body.target_languages) ? body.target_languages.map(String) : [];
  if (!entityType || !entityId || !sourceFields || !targets.length) {
    return json({ error: 'entity_type, entity_id, source_fields and target_languages are required' }, 400);
  }
  if (targets.some((code) => !TARGETS.includes(code))) return json({ error: 'Unsupported target language' }, 400);

  const hash = await sourceHash(sourceFields);
  await db.from('content_translations')
    .update({ review_status: 'Outdated', publish: false, updated_at: new Date().toISOString() })
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .neq('source_hash', hash);

  const results = [];
  for (const target of targets) {
    const { data: job, error: jobError } = await db.from('translation_jobs').insert({
      entity_type: entityType,
      entity_id: entityId,
      target_language: target,
      source_hash: hash,
      status: 'processing',
      provider: PROVIDER
    }).select('id').single();
    if (jobError) throw jobError;

    try {
      const terms = await termsFor(target);
      const items = prepareFields(sourceFields, terms);
      const translated = await translateItems(items, target);
      const fields = rebuildFields(items, translated);
      const { error: upsertError } = await db.from('content_translations').upsert({
        entity_type: entityType,
        entity_id: entityId,
        language: target,
        source_language: 'te',
        fields,
        source_hash: hash,
        translation_method: 'machine',
        provider: PROVIDER,
        review_status: 'Needs Review',
        publish: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'entity_type,entity_id,language' });
      if (upsertError) throw upsertError;
      await db.from('translation_jobs').update({
        status: 'needs_review',
        error_message: null,
        updated_at: new Date().toISOString()
      }).eq('id', job.id);
      results.push({ language: target, status: 'Needs Review' });
    } catch (error) {
      const privateMessage = error?.message === 'PLACEHOLDER_LOST'
        ? 'Protected source text could not be restored'
        : 'Google Translation failed';
      await db.from('translation_jobs').update({
        status: 'failed',
        error_message: privateMessage,
        updated_at: new Date().toISOString()
      }).eq('id', job.id);
      results.push({ language: target, status: 'failed' });
    }
  }
  return json({ entity_type: entityType, entity_id: entityId, source_hash: hash, results });
}

async function translateItems(items, target) {
  const output = items.map((item) => item.original);
  for (const format of ['text', 'html']) {
    const group = items
      .map((item, index) => ({ item, index }))
      .filter((entry) => !entry.item.skip && entry.item.format === format);
    const texts = [];
    for (const part of chunk(group, 80)) {
      texts.push(part);
    }
    for (const part of texts) {
      const translated = await googleTranslate(part.map((entry) => entry.item.protectedText), target, format);
      part.forEach((entry, index) => {
        output[entry.index] = translated[index];
      });
    }
  }
  return output;
}

async function googleTranslate(texts, target, format) {
  if (!texts.length) return [];
  const key = Deno.env.get('GOOGLE_TRANSLATE_API_KEY') || '';
  const project = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID') || '';
  const location = Deno.env.get('GOOGLE_TRANSLATION_LOCATION') || 'us-central1';
  const model = Deno.env.get('GOOGLE_TRANSLATION_MODEL') || 'general/translation-llm';
  if (!key || !project) {
    const error = new Error('TRANSLATION_PROVIDER_UNCONFIGURED');
    error.status = 503;
    throw error;
  }
  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(translationRequestBody({ texts, target, format, projectId: project, location, model }))
  });
  if (!response.ok) {
    const error = new Error('TRANSLATION_PROVIDER_FAILED');
    error.status = 502;
    throw error;
  }
  const payload = await response.json();
  return textsFromProvider(payload, texts.length);
}

async function termsFor(target) {
  const { data, error } = await db.from('translation_terms')
    .select('source_term,target_term,preserve_exact,active,target_language')
    .eq('target_language', target)
    .eq('active', true);
  if (error) return [];
  return data || [];
}

async function status(body) {
  const entityType = String(body.entity_type || '').trim();
  const entityId = String(body.entity_id || '').trim();
  if (!entityType || !entityId) return json({ error: 'entity_type and entity_id are required' }, 400);
  const { data: translations, error } = await db.from('content_translations')
    .select('language,fields,source_hash,translation_method,provider,review_status,publish,updated_at')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);
  if (error) throw error;
  const { data: jobs } = await db.from('translation_jobs')
    .select('target_language,status,source_hash,updated_at')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('updated_at', { ascending: false })
    .limit(20);
  return json({
    translations: translations || [],
    jobs: (jobs || []).map((job) => ({
      language: job.target_language,
      status: job.status,
      source_hash: job.source_hash,
      updated_at: job.updated_at
    }))
  });
}

async function review(body) {
  const entityType = String(body.entity_type || '').trim();
  const entityId = String(body.entity_id || '').trim();
  const language = String(body.language || '').trim();
  const decision = String(body.decision || '').trim();
  if (!entityType || !entityId || !TARGETS.includes(language)) {
    return json({ error: 'entity_type, entity_id and a target language are required' }, 400);
  }
  const { data: row, error } = await db.from('content_translations')
    .select('review_status,publish')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('language', language)
    .maybeSingle();
  if (error) throw error;
  if (!row) return json({ error: 'No translation exists for that language' }, 404);
  const patch = reviewPatch(decision, row);
  const { error: updateError } = await db.from('content_translations')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('language', language);
  if (updateError) throw updateError;
  if (decision === 'verify') {
    await db.from('translation_jobs')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('target_language', language)
      .eq('status', 'needs_review');
  }
  return json({ language, decision, ok: true });
}

async function listTerms() {
  const { data, error } = await db.from('translation_terms')
    .select('id,source_language,source_term,target_language,target_term,preserve_exact,notes,active,updated_at')
    .order('source_term', { ascending: true });
  if (error) throw error;
  return json({ terms: data || [] });
}

async function saveTerm(body) {
  const sourceTerm = String(body.source_term || '').trim();
  const targetLanguage = String(body.target_language || '').trim();
  const targetTerm = String(body.target_term || '').trim();
  if (!sourceTerm || !TARGETS.includes(targetLanguage) || !targetTerm) {
    return json({ error: 'source_term, target_language and target_term are required' }, 400);
  }
  const row = {
    source_language: 'te',
    source_term: sourceTerm,
    target_language: targetLanguage,
    target_term: targetTerm,
    preserve_exact: body.preserve_exact === true,
    notes: String(body.notes || ''),
    active: body.active !== false,
    updated_at: new Date().toISOString()
  };
  const { error } = await db.from('translation_terms').upsert(row, {
    onConflict: 'source_language,source_term,target_language'
  });
  if (error) throw error;
  return json({ ok: true });
}

function cors() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret'
  };
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...cors(), 'content-type': 'application/json; charset=utf-8' }
  });
}
