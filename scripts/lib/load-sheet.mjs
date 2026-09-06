import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SHEET_ID = '19A34Uz6JhvgXZXKpcbz69q6QUgFRuSjyEbnIltMx7X8';

export function loadSheetsApi(config = {}) {
  const source = readFileSync(resolve(root, 'assets/sheets.js'), 'utf8');
  const sandbox = createContext({
    window: {
      BRAMHA_CONFIG: {
        googleSheet: {
          id: SHEET_ID,
          cacheTtlMs: 45000,
          systemHeaders: [],
          tabs: {
            dharma: ['Dharma Sutra'],
            gruhya: ['Gruhya Sutra'],
            articles: ['Articles'],
            mantras: ['Vedic Mantras']
          },
          ...config
        }
      }
    },
    console,
    location: { hostname: 'test', search: '' }
  });
  runInContext(source, sandbox);
  return sandbox.window.BramhaSheets;
}

export async function fetchTabCsv(tab) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${tab} HTTP ${response.status}`);
  return response.text();
}

export async function loadKind(api, tab, kind) {
  const table = api.parseCsv(await fetchTabCsv(tab));
  if (!table.length) return { headers: [], rows: [], publicRows: [] };
  const [headers, ...rows] = table;
  const mapped = api.objectsFromTable(headers, rows, kind);
  return {
    headers,
    rows: mapped,
    publicRows: mapped.filter((row) => api.isPublic(row))
  };
}

export function isHomepageSlide(row) {
  return String(row?.language || '').trim() === 'Homepage Slide';
}

export function publicArticles(rows) {
  return (rows || []).filter((row) => !isHomepageSlide(row));
}

export { SHEET_ID, root };
