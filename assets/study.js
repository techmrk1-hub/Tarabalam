import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cfg = window.BRAMHA_CONFIG || {};
const client = cfg.supabaseUrl && cfg.supabasePublishableKey
  ? createClient(cfg.supabaseUrl, cfg.supabasePublishableKey)
  : null;

async function sessionUser() {
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.user || null;
}

function accountLink(next) {
  const url = new URL('/account/', location.origin);
  if (next) url.searchParams.set('next', next);
  return url.pathname + url.search;
}

async function remember(detail) {
  const user = await sessionUser();
  if (!user || !detail?.contentId) return;
  const row = {
    user_id: user.id,
    content_type: detail.contentType,
    content_id: detail.contentId,
    last_position: detail.path || location.pathname,
    last_read_at: new Date().toISOString()
  };
  await client.from('reading_history').upsert(row, { onConflict: 'user_id,content_type,content_id' });
}

async function toggleBookmark(detail, button) {
  const user = await sessionUser();
  if (!user) { location.href = accountLink(location.pathname + location.search); return; }
  const existing = await client.from('bookmarks').select('id').eq('user_id', user.id).eq('content_type', detail.contentType).eq('content_id', detail.contentId).maybeSingle();
  if (existing.data?.id) {
    await client.from('bookmarks').delete().eq('id', existing.data.id);
    button.textContent = 'Bookmark';
    button.setAttribute('aria-pressed', 'false');
  } else {
    const { error } = await client.from('bookmarks').insert({ user_id: user.id, content_type: detail.contentType, content_id: detail.contentId });
    if (error) throw error;
    button.textContent = 'Bookmarked';
    button.setAttribute('aria-pressed', 'true');
  }
}

async function saveNote(detail, text, status) {
  const user = await sessionUser();
  if (!user) { location.href = accountLink(location.pathname + location.search); return; }
  const note = text.trim();
  if (!note) { status.textContent = 'Write a note before saving.'; return; }
  const { error } = await client.from('personal_notes').insert({ user_id: user.id, content_type: detail.contentType, content_id: detail.contentId, note });
  status.textContent = error ? 'The note could not be saved.' : 'Note saved to your study desk.';
}

function mountStudy(detail) {
  const bar = document.getElementById('studyBar');
  if (!bar || bar.dataset.ready) return;
  bar.dataset.ready = '1';
  bar.innerHTML = '';
  const bookmark = document.createElement('button');
  bookmark.type = 'button';
  bookmark.className = 'btn secondary';
  bookmark.textContent = 'Bookmark';
  const noteButton = document.createElement('button');
  noteButton.type = 'button';
  noteButton.className = 'btn secondary';
  noteButton.textContent = 'Personal note';
  const account = document.createElement('a');
  account.href = '/account/';
  account.textContent = 'Study desk';
  bar.append(bookmark, noteButton, account);
  const box = document.createElement('div');
  box.hidden = true;
  const area = document.createElement('textarea');
  area.rows = 4;
  area.placeholder = 'A private note for your study. It is visible only to you.';
  area.setAttribute('aria-label', 'Personal note');
  const save = document.createElement('button');
  save.type = 'button';
  save.className = 'btn';
  save.textContent = 'Save note';
  const status = document.createElement('p');
  status.className = 'verify-note';
  box.append(area, save, status);
  bar.after(box);
  bookmark.addEventListener('click', () => toggleBookmark(detail, bookmark).catch(() => { status.textContent = 'The bookmark could not be saved.'; }));
  noteButton.addEventListener('click', () => { box.hidden = !box.hidden; if (!box.hidden) area.focus(); });
  save.addEventListener('click', () => saveNote(detail, area.value, status));
  sessionUser().then(async (user) => {
    if (!user) return;
    const mark = await client.from('bookmarks').select('id').eq('user_id', user.id).eq('content_type', detail.contentType).eq('content_id', detail.contentId).maybeSingle();
    if (mark.data?.id) { bookmark.textContent = 'Bookmarked'; bookmark.setAttribute('aria-pressed', 'true'); }
  }).catch(() => {});
  remember(detail).catch(() => {});
}

document.addEventListener('bramha:passage', (event) => mountStudy(event.detail));

async function renderDesk() {
  const host = document.getElementById('studyDesk');
  if (!host || !client) return;
  const user = await sessionUser();
  const form = document.getElementById('authForm');
  const message = document.getElementById('authMessage');
  if (!user) {
    host.innerHTML = '<p class="empty">Sign in to see bookmarks, notes, and reading history. Public reading does not require an account.</p>';
    return;
  }
  if (form) form.hidden = true;
  const name = user.email || 'Signed in';
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const safePath = (value) => {
    const path = String(value || '/');
    return path.startsWith('/') && !path.startsWith('//') ? path : '/';
  };
  const [marks, notes, history] = await Promise.all([
    client.from('bookmarks').select('id,content_type,content_id,created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
    client.from('personal_notes').select('id,content_type,content_id,note,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }),
    client.from('reading_history').select('id,content_type,content_id,last_position,last_read_at').eq('user_id', user.id).order('last_read_at', { ascending: false }).limit(30)
  ]);
  const list = (rows, render) => rows?.length ? rows.map(render).join('') : '<p class="empty">Nothing saved yet.</p>';
  host.innerHTML = `<p class="lede">Signed in as ${esc(name)}.</p>
    <h2>Bookmarks</h2>${list(marks.data, (row) => `<p>${esc(row.content_type)}: ${esc(row.content_id)}</p>`)}
    <h2>Notes</h2>${list(notes.data, (row) => `<article class="paper-card"><p class="kicker">${esc(row.content_type)} · ${esc(row.content_id)}</p><p>${esc(row.note)}</p></article>`)}
    <h2>Reading history</h2>${list(history.data, (row) => `<p><a href="${esc(safePath(row.last_position))}">${esc(row.content_type)}: ${esc(row.content_id)}</a></p>`)}
    <p><button type="button" class="btn secondary" id="signOut">Sign out</button></p>`;
  document.getElementById('signOut')?.addEventListener('click', async () => {
    await client.auth.signOut();
    location.reload();
  });
  if (message) message.textContent = '';
}

const authForm = document.getElementById('authForm');
authForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = document.getElementById('authMessage');
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value || '';
  const mode = event.submitter?.dataset.auth || 'otp';
  if (!client || !email) { message.textContent = 'Enter an email address.'; return; }
  message.textContent = 'Sending request…';
  try {
    if (mode === 'password' && password) {
      let result = await client.auth.signInWithPassword({ email, password });
      if (result.error) result = await client.auth.signUp({ email, password });
      if (result.error) throw result.error;
      message.textContent = result.data.session ? 'Signed in.' : 'Check your email to confirm the account.';
      if (result.data.session) renderDesk();
      return;
    }
    const next = new URLSearchParams(location.search).get('next') || '/account/';
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}${next.startsWith('/') ? next : '/account/'}` }
    });
    if (error) throw error;
    message.textContent = 'Check your email for the sign-in link.';
  } catch (error) {
    message.textContent = error.message || 'Sign-in could not be completed.';
  }
});

if (document.getElementById('studyDesk')) renderDesk().catch(() => {
  const host = document.getElementById('studyDesk');
  if (host) host.innerHTML = '<p class="error">Unable to load your study desk. Please try again.</p>';
});
