(function (root) {
  const SITE = 'https://bramha.org';

  function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function namedSlug(value, fallback) {
    const folded = String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
    if (folded && folded !== 'index') return folded;
    const backup = String(fallback || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
    return backup || 'entry';
  }

  function usableNamedSlug(value) {
    const raw = String(value || '').trim();
    if (!raw || raw.startsWith('/') || raw.includes('/') || raw.includes('?') || raw.includes('#')) return '';
    return namedSlug(raw, '');
  }

  function withSlash(path) {
    if (!path.startsWith('/')) path = `/${path}`;
    if (/\.[a-z0-9]+$/i.test(path)) return path;
    return path.endsWith('/') ? path : `${path}/`;
  }

  function dharmaPath(row, level) {
    const prashna = num(row?.prashna);
    const patala = num(row?.patala);
    const khanda = num(row?.khanda);
    const sutra = num(row?.sutra_number);
    if (level === 'collection' || prashna == null) return '/dharma-sutra/';
    if (level === 'prashna' || patala == null) return `/dharma-sutra/prasna-${prashna}/`;
    if (level === 'patala' || khanda == null) return `/dharma-sutra/prasna-${prashna}/patala-${patala}/`;
    if (level === 'khanda' || sutra == null) return `/dharma-sutra/prasna-${prashna}/patala-${patala}/khanda-${khanda}/`;
    return `/dharma-sutra/prasna-${prashna}/patala-${patala}/khanda-${khanda}/sutra-${sutra}/`;
  }

  function gruhyaPath(row, level) {
    const patala = num(row?.patala);
    const khanda = num(row?.section_number ?? row?.khanda);
    const sutra = num(row?.sutra_number);
    if (level === 'collection' || patala == null) return '/gruhya-sutra/';
    if (level === 'patala' || khanda == null) return `/gruhya-sutra/patala-${patala}/`;
    if (level === 'khanda' || sutra == null) return `/gruhya-sutra/patala-${patala}/khanda-${khanda}/`;
    return `/gruhya-sutra/patala-${patala}/khanda-${khanda}/sutra-${sutra}/`;
  }

  function mantraPath(row) {
    const slug = usableNamedSlug(row?.slug) || namedSlug(row?.title || row?.display_name, row?.unique_id || row?.mantra_id || 'mantra');
    return `/vedic-mantras/${slug}/`;
  }

  function articlePath(row) {
    const slug = usableNamedSlug(row?.slug) || namedSlug(row?.title || row?.display_name, row?.article_id || row?.unique_id || 'article');
    return `/articles/${slug}/`;
  }

  function pathFor(kind, row, level) {
    if (kind === 'dharma' || kind === 'dharma_sutras') return dharmaPath(row, level);
    if (kind === 'gruhya' || kind === 'gruhya_sutras') return gruhyaPath(row, level);
    if (kind === 'mantras' || kind === 'vedic_mantras') return mantraPath(row);
    if (kind === 'articles') return articlePath(row);
    return '/';
  }

  function parsePath(pathname) {
    const path = withSlash(String(pathname || '/').replace(/index\.html$/i, ''));
    let m = path.match(/^\/dharma-sutra\/(?:prasna-(\d+)(?:\/patala-(\d+)(?:\/khanda-(\d+)(?:\/sutra-(-?\d+))?)?)?)?\/?$/);
    if (m) {
      return {
        kind: 'dharma',
        collection: true,
        prashna: m[1] ? Number(m[1]) : null,
        patala: m[2] ? Number(m[2]) : null,
        khanda: m[3] ? Number(m[3]) : null,
        sutra: m[4] ? Number(m[4]) : null,
        leaf: Boolean(m[4])
      };
    }
    m = path.match(/^\/gruhya-sutra\/(?:patala-(\d+)(?:\/(?:khanda|section)-(\d+)(?:\/sutra-(-?\d+))?)?)?\/?$/);
    if (m) {
      return {
        kind: 'gruhya',
        collection: true,
        patala: m[1] ? Number(m[1]) : null,
        khanda: m[2] ? Number(m[2]) : null,
        section: m[2] ? Number(m[2]) : null,
        sutra: m[3] ? Number(m[3]) : null,
        leaf: Boolean(m[3])
      };
    }
    m = path.match(/^\/vedic-mantras\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
    if (m) return { kind: 'mantras', slug: m[1], leaf: true };
    m = path.match(/^\/articles\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
    if (m) return { kind: 'articles', slug: m[1], leaf: true };
    if (path === '/vedic-mantras/') return { kind: 'mantras', leaf: false };
    if (path === '/articles/') return { kind: 'articles', leaf: false };
    return null;
  }

  function sameDharma(row, parsed) {
    if (!row || !parsed) return false;
    if (parsed.prashna != null && num(row.prashna) !== parsed.prashna) return false;
    if (parsed.patala != null && num(row.patala) !== parsed.patala) return false;
    if (parsed.khanda != null && num(row.khanda) !== parsed.khanda) return false;
    if (parsed.sutra != null && num(row.sutra_number) !== parsed.sutra) return false;
    return true;
  }

  function sameGruhya(row, parsed) {
    if (!row || !parsed) return false;
    if (parsed.patala != null && num(row.patala) !== parsed.patala) return false;
    const section = num(row.section_number ?? row.khanda);
    if (parsed.khanda != null && section !== parsed.khanda) return false;
    if (parsed.sutra != null && num(row.sutra_number) !== parsed.sutra) return false;
    return true;
  }

  function findRow(kind, rows, parsed, wantedId) {
    const list = Array.isArray(rows) ? rows : [];
    if (wantedId) {
      const byId = list.findIndex((row) => String(row.unique_id || row.article_id || row.mantra_id) === String(wantedId));
      if (byId >= 0) return byId;
    }
    if (!parsed) return 0;
    if (kind === 'dharma' && parsed.kind === 'dharma' && parsed.leaf) {
      return list.findIndex((row) => sameDharma(row, parsed));
    }
    if (kind === 'gruhya' && parsed.kind === 'gruhya' && parsed.leaf) {
      return list.findIndex((row) => sameGruhya(row, parsed));
    }
    if ((kind === 'mantras' || kind === 'articles') && parsed.slug) {
      return list.findIndex((row) => {
        const path = pathFor(kind, row);
        return path === `/${kind === 'mantras' ? 'vedic-mantras' : 'articles'}/${parsed.slug}/`;
      });
    }
    return 0;
  }

  function citation(kind, row) {
    if (kind === 'dharma') return [row.prashna, row.patala, row.khanda, row.sutra_number].join('.');
    if (kind === 'gruhya') return [row.patala, row.section_number ?? row.khanda, row.sutra_number].join('.');
    return '';
  }

  function workTitle(kind) {
    if (kind === 'dharma') return 'Āpastamba Dharma Sūtra';
    if (kind === 'gruhya') return 'Āpastamba Gṛhya Sūtra';
    if (kind === 'mantras') return 'Vedic Mantras';
    if (kind === 'articles') return 'Articles';
    return 'Bramha.org';
  }

  function pageTitle(kind, row) {
    if (kind === 'dharma') return `${workTitle(kind)} ${citation(kind, row)}`;
    if (kind === 'gruhya') return `${workTitle(kind)} ${citation(kind, row)}`;
    return row.title || row.display_name || row.unique_id || workTitle(kind);
  }

  function canonical(path) {
    return `${SITE}${withSlash(path)}`;
  }

  const api = {
    SITE,
    namedSlug,
    usableNamedSlug,
    withSlash,
    dharmaPath,
    gruhyaPath,
    mantraPath,
    articlePath,
    pathFor,
    parsePath,
    findRow,
    sameDharma,
    sameGruhya,
    citation,
    workTitle,
    pageTitle,
    canonical
  };

  root.BramhaRoutes = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
