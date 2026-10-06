// Retired. Bramha.org does not translate meaning.
// Script conversion lives in the aksharamukha function.

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'content-type': 'application/json; charset=utf-8'
};

Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  return new Response(JSON.stringify({
    error: 'Semantic translation has been removed. Use Script View.'
  }), { status: 410, headers: cors });
});
