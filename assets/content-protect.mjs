/**
 * Telugu is the canonical text. This module only identifies the script of
 * stored content so a display copy can be requested. It never writes back
 * to the source and it never calls a translation provider.
 */

export const SCRIPTS = [
  { id: 'Telugu', label: 'తెలుగు' },
  { id: 'Devanagari', label: 'देवनागरी' },
  { id: 'Kannada', label: 'ಕನ್ನಡ' },
  { id: 'Tamil', label: 'தமிழ்' },
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
  if (/[āīūṝṟḷṅñṭḍṇśṣḥṃĀĪŪṜṞḶṄÑṬḌṆŚṢḤṂ]/.test(value)) return 'IAST';
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
