/**
 * Turn a public Google Doc HTML export into article HTML.
 * Tags stay. Scripts, styles, and unknown attributes do not.
 */

const KEEP = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'a', 'strong', 'em', 'b', 'i',
  'ul', 'ol', 'li', 'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
]);
const UNWRAP = new Set(['html', 'body', 'span', 'font', 'section', 'article']);
// Google's HTML export puts the running header and footer in div/header/footer.
// Those regions are not the article. Drop the whole subtree.
const CHROME = new Set(['div', 'header', 'footer']);
const DROP = new Set(['script', 'style', 'noscript', 'iframe', 'object', 'embed', 'svg', 'img', 'link', 'meta', 'head']);
const VOID = new Set(['br', 'hr']);

export function cleanDocHtml(raw) {
  const source = String(raw || '');
  const css = [...source.matchAll(/<style[\s\S]*?<\/style>/gi)].map((match) => match[0]).join('\n');
  const bold = classesWith(css, /font-weight:\s*(700|bold)/i);
  const italic = classesWith(css, /font-style:\s*italic/i);
  const centered = classesWith(css, /text-align:\s*center/i);
  const bodyMatch = source.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : source;
  const root = { tag: '#root', children: [] };
  const stack = [root];
  let skipping = 0;
  for (const token of tokenize(body)) {
    if (token.type === 'text') {
      if (!skipping) stack[stack.length - 1].children.push(normalizeText(token.value));
      continue;
    }
    const tag = token.tag;
    if (token.type === 'end') {
      if (skipping && (DROP.has(tag) || CHROME.has(tag))) skipping -= 1;
      else if (!skipping) {
        if (tag === 'span' || tag === 'font') closeEmphasis(stack, tag);
        else closeTag(stack, tag);
      }
      continue;
    }
    if (DROP.has(tag) || CHROME.has(tag)) {
      if (!token.self) skipping += 1;
      continue;
    }
    if (skipping) continue;
    if (token.type !== 'start') continue;
    const emphasis = emphasisTag(token, bold, italic);
    if (emphasis) {
      const node = { tag: emphasis, from: token.tag, children: [] };
      stack[stack.length - 1].children.push(node);
      if (!token.self) stack.push(node);
      continue;
    }
    if (UNWRAP.has(tag)) continue;
    if (!KEEP.has(tag)) continue;
    const node = { tag, attrs: attributesFor(tag, token.attrs, centered), children: [] };
    stack[stack.length - 1].children.push(node);
    if (!VOID.has(tag) && !token.self) stack.push(node);
  }
  return renderChildren(prune(root.children)).trim();
}

function classesWith(css, pattern) {
  const names = new Set();
  for (const match of css.matchAll(/\.([a-zA-Z0-9_-]+)\{([^}]*)\}/g)) {
    if (pattern.test(match[2])) names.add(match[1]);
  }
  return names;
}

function emphasisTag(token, bold, italic) {
  if (token.tag !== 'span' && token.tag !== 'font') return '';
  const classes = new Set(String(token.attrs.class || '').split(/\s+/).filter(Boolean));
  const isBold = [...classes].some((name) => bold.has(name));
  const isItalic = [...classes].some((name) => italic.has(name));
  if (isBold && isItalic) return 'strong';
  if (isBold) return 'strong';
  if (isItalic) return 'em';
  return '';
}

function attributesFor(tag, attrs, centered) {
  const out = {};
  if (tag === 'a') {
    const href = safeHref(attrs.href || '');
    if (href) out.href = href;
  }
  if (isCentered(attrs, centered)) out.class = 'doc-center';
  return out;
}

function isCentered(attrs, centered) {
  const classes = String(attrs?.class || '').split(/\s+/).filter(Boolean);
  return classes.some((name) => centered.has(name));
}

function safeHref(value) {
  let href = decodeEntities(String(value || '').trim());
  const google = href.match(/^https?:\/\/(?:www\.)?google\.com\/url\?([^#]+)/i);
  if (google) {
    const params = new URLSearchParams(google[1]);
    href = params.get('q') || '';
  }
  if (/^mailto:[^\s]+$/i.test(href)) return href;
  try {
    const url = new URL(href);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.toString();
  } catch {
    return '';
  }
}

function closeEmphasis(stack, tag) {
  const top = stack[stack.length - 1];
  if (top && top.from === tag) stack.pop();
}

function closeTag(stack, tag) {
  for (let index = stack.length - 1; index > 0; index -= 1) {
    if (stack[index].tag === tag) {
      stack.splice(index);
      return;
    }
  }
}

function prune(children) {
  const out = [];
  for (const child of children) {
    if (typeof child === 'string') {
      if (child) out.push(child);
      continue;
    }
    child.children = prune(child.children || []);
    if (VOID.has(child.tag)) {
      out.push(child);
      continue;
    }
    if (!visibleText(child).trim() && !hasLink(child)) continue;
    out.push(child);
  }
  return out;
}

function visibleText(node) {
  if (typeof node === 'string') return node.replace(/\u00a0/g, ' ');
  return (node.children || []).map(visibleText).join('');
}

function hasLink(node) {
  if (typeof node === 'string') return false;
  if (node.tag === 'a' && node.attrs?.href) return true;
  return (node.children || []).some(hasLink);
}

function renderChildren(children) {
  return children.map(renderNode).join('');
}

function renderNode(node) {
  if (typeof node === 'string') return escapeText(node);
  if (VOID.has(node.tag)) return `<${node.tag}>`;
  const attrs = Object.entries(node.attrs || {})
    .map(([key, value]) => ` ${key}="${escapeText(value)}"`)
    .join('');
  return `<${node.tag}${attrs}>${renderChildren(node.children)}</${node.tag}>`;
}

function escapeText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '\u2013',
  mdash: '\u2014',
  hellip: '\u2026',
  lsquo: '\u2018',
  rsquo: '\u2019',
  ldquo: '\u201c',
  rdquo: '\u201d',
  sbquo: '\u201a',
  bdquo: '\u201e',
  bull: '\u2022',
  middot: '\u00b7',
  times: '\u00d7',
  divide: '\u00f7',
  laquo: '\u00ab',
  raquo: '\u00bb',
  copy: '\u00a9',
  reg: '\u00ae',
  trade: '\u2122',
  deg: '\u00b0',
  plusmn: '\u00b1'
};

function normalizeText(value) {
  return decodeEntities(value).replace(/[ \t\f\v]+/g, ' ');
}

function decodeEntities(value) {
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => safeChar(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => safeChar(Number(dec)))
    .replace(/&([a-zA-Z]+);/g, (entity, name) => {
      const decoded = NAMED_ENTITIES[name.toLowerCase()];
      return decoded === undefined ? entity : decoded;
    });
}

function safeChar(code) {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return '';
  if (code < 32 && code !== 9 && code !== 10 && code !== 13) return '';
  return String.fromCodePoint(code);
}

function tokenize(html) {
  const tokens = [];
  const pattern = /<!--[\s\S]*?-->|<\/([a-zA-Z0-9]+)\s*>|<([a-zA-Z0-9]+)([^>]*?)(\/?)>/g;
  let cursor = 0;
  for (const match of html.matchAll(pattern)) {
    if (match.index > cursor) tokens.push({ type: 'text', value: html.slice(cursor, match.index) });
    cursor = match.index + match[0].length;
    if (match[0].startsWith('<!--')) continue;
    if (match[1]) {
      tokens.push({ type: 'end', tag: match[1].toLowerCase() });
      continue;
    }
    tokens.push({
      type: 'start',
      tag: match[2].toLowerCase(),
      attrs: parseAttrs(match[3] || ''),
      self: Boolean(match[4]) || match[2].toLowerCase() === 'br' || match[2].toLowerCase() === 'hr'
    });
  }
  if (cursor < html.length) tokens.push({ type: 'text', value: html.slice(cursor) });
  return tokens;
}

function parseAttrs(source) {
  const attrs = {};
  for (const match of source.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attrs;
}
