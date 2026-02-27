import "https://deno.land/std@0.168.0/dotenv/load.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    let res: Response;

    if (action === "generate-topic") {
      res = await fetch("http://38.49.209.149:8000/generate-topic", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const body = await req.json();
      res = await fetch("http://38.49.209.149:8000/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    const data = await res.text();

    if (!res.ok) {
      const detail = (() => {
        try { return JSON.parse(data)?.detail; } catch { return data; }
      })();
      return new Response(JSON.stringify({ error: detail || `Upstream error: ${res.status}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(data, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
