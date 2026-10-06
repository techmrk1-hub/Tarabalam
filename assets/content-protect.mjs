/**
 * Telugu is the canonical text. This module only identifies the script of
 * stored content so a display copy can be requested. It never writes back
 * to the source and it never calls a translation provider.
 */

export const SCRIPTS = [
  { id: 'Telugu', label: '\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41' },
  { id: 'Devanagari', label: '\u0926\u0947\u0935\u0928\u093e\u0917\u0930\u0940' },
  { id: 'Kannada', label: '\u0c95\u0ca8\u0ccd\u0ca8\u0ca1' },
  { id: 'Tamil', label: '\u0ba4\u0bae\u0bbf\u0bb4\u0bcd' },
  { id: 'IAST', label: 'IAST' }
];

const SOURCE_ROLES = new Set(['deva', 'telugu', 'translit', 'padaccheda']);

export function isSourceScriptRole(role) {
  return SOURCE_ROLES.has(role);
}

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function conversionSource(text) {
  const value = String(text || '');
  if (/[\u0C00-\u0C7F]/.test(value)) return 'Telugu';
  if (/[\u0900-\u097F]/.test(value)) return 'Devanagari';
  if (/[\u0C80-\u0CFF]/.test(value)) return 'Kannada';
  if (/[\u0B80-\u0BFF]/.test(value)) return 'Tamil';
  if (/[\u0101\u012b\u016b\u1e5b\u1e5d\u1e37\u1e45\u00f1\u1e6d\u1e0d\u1e47\u015b\u1e63\u1e25\u1e43\u0100\u012a\u016a\u1e5a\u1e5c\u1e36\u1e44\u00d1\u1e6c\u1e0c\u1e46\u015a\u1e62\u1e24\u1e42]/.test(value)) return 'IAST';
  return '';
}

export function shouldRequestScript(text, target) {
  const source = conversionSource(text);
  if (!source || !String(text || '').trim()) return false;
  if (target === 'Telugu') return false;
  return source !== target;
}

export function scriptCacheKey({ source, target, hash, nativize }) {
  return `${source}|${target}|${hash}|${nativize === true}`;
}
