(function () {
  const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ta', name: 'Tamil' }
  ];
  const state = { record: null, fields: {}, hash: '', translations: [], jobs: [] };
  const $ = (id) => document.getElementById(id);

  function secret() {
    return sessionStorage.getItem('bramha.translationAdmin') || '';
  }

  function note(message, tone) {
    const node = $('adminNote');
    node.className = tone === 'error' ? 'error' : 'notice';
    node.textContent = message;
  }

  async function call(body) {
    const cfg = window.BRAMHA_CONFIG;
    const response = await fetch(`${cfg.supabaseUrl}/functions/v1/translate-content`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: cfg.supabasePublishableKey,
        authorization: `Bearer ${cfg.supabasePublishableKey}`,
        'x-admin-secret': secret()
      },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'The translation service did not accept that request.');
    return payload;
  }

  function selectedLanguages() {
    return [...document.querySelectorAll('#langPick input:checked')].map((input) => input.value);
  }

  function entityIdentity(record, kind) {
    if (kind === 'articles') return { entity_type: 'article', entity_id: record.article_id || record.unique_id };
    if (kind === 'mantras') return { entity_type: 'vedic_mantra', entity_id: record.unique_id || record.mantra_id };
    if (kind === 'gruhya') return { entity_type: 'gruhya_sutra', entity_id: record.unique_id };
    return { entity_type: 'dharma_sutra', entity_id: record.unique_id };
  }

  async function loadRecords() {
    const kind = $('collection').value;
    const table = kind === 'articles' ? 'articles' : kind === 'gruhya' ? 'gruhya_sutras' : kind === 'mantras' ? 'vedic_mantras' : 'dharma_sutras';
    const loaded = await window.loadCmsTable(table);
    const rows = (loaded.rows || []).filter((row) => String(row.language || '') !== 'Homepage Slide');
    const select = $('record');
    select.innerHTML = '';
    rows.forEach((row, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = row.display_name || row.title || row.unique_id || row.article_id;
      select.appendChild(option);
    });
    select.dataset.kind = kind;
    select._rows = rows;
  }

  async function showRecord() {
    const select = $('record');
    const record = (select._rows || [])[Number(select.value)];
    if (!record) {
      note('No verified record is available in that collection.', 'error');
      return;
    }
    const protect = await import('/assets/content-protect.mjs');
    state.record = record;
    state.kind = select.dataset.kind;
    state.fields = protect.explanatoryFields(record);
    if (state.kind === 'articles') {
      if (record.title) state.fields.title = record.title;
      if (record.summary) state.fields.summary = record.summary;
      if (record.content) state.fields.content = record.content;
    }
    state.hash = await protect.sourceHash(state.fields);
    const identity = entityIdentity(record, state.kind);
    state.identity = identity;
    $('teluguOriginal').textContent = Object.entries(state.fields).map(([key, value]) => `${key}\n${value}`).join('\n\n') || 'This record has no Telugu explanatory fields to translate. Source scripture is not sent for semantic translation.';
    await refreshStatus();
  }

  function statusFor(code) {
    return (state.translations || []).find((row) => row.language === code) || null;
  }

  function renderLanguages() {
    const host = $('langStatus');
    host.innerHTML = '';
    const master = document.createElement('article');
    master.className = 'paper-card';
    master.innerHTML = '<h2>Telugu original</h2><p>Verified editorial master. Generate does not publish it, and it is never replaced by a translation.</p>';
    host.appendChild(master);
    LANGUAGES.forEach((language) => {
      const row = statusFor(language.code);
      const card = document.createElement('article');
      card.className = 'paper-card';
      const label = row ? `${row.review_status}${row.publish ? ' \u00b7 Published' : ''}` : 'Not Generated';
      const stale = row && row.source_hash && row.source_hash !== state.hash;
      card.innerHTML = `<h2>${language.name}</h2><p class=\"kicker\">${label}${stale ? ' \u00b7 Source changed' : ''}</p>`;
      const actions = document.createElement('div');
      actions.className = 'study-bar';
      const add = (text, decision) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn secondary';
        button.textContent = text;
        button.addEventListener('click', () => act(language.code, decision));
        actions.appendChild(button);
      };
      if (!row) add('Generate', 'generate');
      else {
        add('Preview', 'preview');
        add('Verify', 'verify');
        add('Reject', 'reject');
        add(row.publish ? 'Unpublish' : 'Publish', row.publish ? 'unpublish' : 'publish');
        add('Regenerate', 'generate');
        add('Mark Outdated', 'outdated');
      }
      card.appendChild(actions);
      const preview = document.createElement('pre');
      preview.className = 'notice';
      preview.hidden = true;
      preview.dataset.preview = language.code;
      card.appendChild(preview);
      host.appendChild(card);
    });
  }

  async function refreshStatus() {
    if (!secret()) {
      note('Enter the translation admin secret to load review status. The secret stays in this browser tab.', 'error');
      state.translations = [];
      renderLanguages();
      return;
    }
    try {
      const payload = await call({ action: 'status', ...state.identity });
      state.translations = payload.translations || [];
      state.jobs = payload.jobs || [];
      const failed = state.jobs.some((job) => job.status === 'failed');
      note(failed
        ? 'A translation job failed. The previous translation text was kept. Generate does not publish.'
        : 'Review status loaded. Generate does not publish.');
      renderLanguages();
    } catch (error) {
      note(error.message, 'error');
    }
  }

  async function act(language, decision) {
    if (!secret()) {
      note('Enter the translation admin secret first.', 'error');
      return;
    }
    try {
      if (decision === 'preview') {
        const row = statusFor(language);
        const node = document.querySelector(`[data-preview=\"${language}\"]`);
        if (node && row) {
          node.hidden = false;
          node.textContent = Object.entries(row.fields || {}).map(([key, value]) => `${key}\n${value}`).join('\n\n');
        }
        return;
      }
      if (decision === 'generate') {
        note(`Generating ${language}. This stays in Needs Review until a person verifies it.`);
        await call({
          action: 'generate',
          ...state.identity,
          source_fields: state.fields,
          target_languages: [language]
        });
      } else {
        await call({ action: 'review', ...state.identity, language, decision });
      }
      await refreshStatus();
    } catch (error) {
      note(error.message, 'error');
    }
  }

  async function generateSelected(all) {
    const targets = all ? LANGUAGES.map((item) => item.code) : selectedLanguages();
    if (!targets.length) {
      note('Select at least one language.', 'error');
      return;
    }
    if (!state.identity) {
      note('Choose a record first.', 'error');
      return;
    }
    note('Generating drafts. Nothing is published by this step.');
    try {
      await call({
        action: 'generate',
        ...state.identity,
        source_fields: state.fields,
        target_languages: targets
      });
      await refreshStatus();
    } catch (error) {
      note(error.message, 'error');
    }
  }

  async function saveTerm(event) {
    event.preventDefault();
    try {
      await call({
        action: 'save-term',
        source_term: $('termSource').value,
        target_language: $('termLanguage').value,
        target_term: $('termTarget').value,
        notes: $('termNotes').value,
        preserve_exact: $('termExact').checked,
        active: true
      });
      $('termSource').value = '';
      $('termTarget').value = '';
      $('termNotes').value = '';
      note('Terminology saved for later translations. It is not inserted into public pages by itself.');
    } catch (error) {
      note(error.message, 'error');
    }
  }

  $('saveSecret').addEventListener('click', () => {
    sessionStorage.setItem('bramha.translationAdmin', $('adminSecret').value.trim());
    $('adminSecret').value = '';
    note('Secret stored for this tab only.');
    if (state.identity) refreshStatus();
  });
  $('collection').addEventListener('change', () => loadRecords().then(showRecord).catch((error) => note(error.message, 'error')));
  $('record').addEventListener('change', () => showRecord().catch((error) => note(error.message, 'error')));
  $('generateAll').addEventListener('click', () => generateSelected(true));
  $('generateSelected').addEventListener('click', () => generateSelected(false));
  $('termForm').addEventListener('submit', saveTerm);
  loadRecords().then(showRecord).catch((error) => note(error.message, 'error'));
})();
