window.BRAMHA_CONFIG = {
  supabaseUrl: 'https://givhnwpdykzeamtutzfx.supabase.co',
  supabasePublishableKey: 'sb_publishable_3MxCEsjGVKGB3-vmZdi_WQ_BEmk2GIH',
  googleSheet: {
    name: 'Bramha.org - Sutra Database',
    /* Spreadsheet ID from the Sheet URL: docs.google.com/spreadsheets/d/<THIS>/edit */
    id: '19A34Uz6JhvgXZXKpcbz69q6QUgFRuSjyEbnIltMx7X8',
    /* Optional Apps Script Web App URL that returns { dharma, gruhya, articles } */
    webAppUrl: '',
    cacheTtlMs: 45000,
    /* Extra header names treated as system/metadata, not content sections */
    systemHeaders: [],
    tabs: {
      dharma: ['Dharma Sutra', 'Dharma Sūtra', 'Dharma Sūtras', 'Dharma Sutras', 'dharma_sutras', 'Dharma'],
      gruhya: ['Gruhya Sutra', 'Gṛhya Sūtra', 'Grhya Sutra', 'Gṛhya Sūtras', 'Gruhya Sutras', 'gruhya_sutras', 'Gruhya', 'Gṛhya'],
      articles: ['Articles', 'articles', 'Homepage Slides']
    }
  }
};
