import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mapa de estados brasileiros para siglas
const stateToUF: Record<string, string> = {
  "acre": "AC", "alagoas": "AL", "amapá": "AP", "amazonas": "AM",
  "bahia": "BA", "ceará": "CE", "distrito federal": "DF", "espírito santo": "ES",
  "goiás": "GO", "maranhão": "MA", "mato grosso": "MT", "mato grosso do sul": "MS",
  "minas gerais": "MG", "pará": "PA", "paraíba": "PB", "paraná": "PR",
  "pernambuco": "PE", "piauí": "PI", "rio de janeiro": "RJ", "rio grande do norte": "RN",
  "rio grande do sul": "RS", "rondônia": "RO", "roraima": "RR", "santa catarina": "SC",
  "são paulo": "SP", "sergipe": "SE", "tocantins": "TO",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { q, limit = 8 } = await req.json();

    if (!q || q.length < 3) {
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=${limit}&addressdetails=1&countrycodes=br&accept-language=pt-BR&featuretype=city`;

    const res = await fetch(nominatimUrl, {
      headers: { "User-Agent": "PrazerPerfeito/1.0" },
    });

    const data = await res.json();

    const cities = data.map((item: any) => {
      const addr = item.address || {};
      const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.county || "";
      const stateRaw = (addr.state || "").toLowerCase();
      const stateCode = addr.state_code?.toUpperCase() || stateToUF[stateRaw] || addr.state || "";
      const label = cityName && stateCode ? `${cityName} / ${stateCode}` : cityName || (item.display_name as string).split(", ").slice(0, 2).join(", ");
      return {
        label,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      };
    });

    return new Response(JSON.stringify(cities), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
