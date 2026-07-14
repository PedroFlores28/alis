// Supabase Edge Function: analyze-evidence
// Secret requerido: ANTHROPIC_API_KEY
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) return json({ error: "Falta ANTHROPIC_API_KEY en Secrets" }, 500);

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "No autorizado" }, 401);

    const body = await req.json();
    const {
      evidenceId,
      filePath,
      fileBase64,
      mimeType,
      fileName,
      student,
      cneb,
    } = body || {};

    if (!student?.name) return json({ error: "Falta datos del alumno" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY");
    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });

    let mediaType = mimeType || "image/jpeg";
    let b64 = fileBase64 || null;

    if (!b64 && filePath) {
      const { data: blob, error: dlErr } = await supabase.storage.from("evidence").download(filePath);
      if (dlErr || !blob) return json({ error: "No se pudo leer el archivo: " + (dlErr?.message || "") }, 400);
      const buf = new Uint8Array(await blob.arrayBuffer());
      b64 = bytesToBase64(buf);
      mediaType = blob.type || mediaType;
    }

    if (!b64) return json({ error: "No hay archivo para analizar" }, 400);

    // Límite práctico para Edge (~4.5MB base64)
    if (b64.length > 6_000_000) {
      return json({ error: "Archivo demasiado grande para análisis. Usa una foto más liviana." }, 413);
    }

    const isPdf = mediaType.includes("pdf") || /\.pdf$/i.test(fileName || "");
    const contentBlock = isPdf
      ? {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: b64 },
        }
      : {
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType.startsWith("image/") ? mediaType : "image/jpeg",
            data: b64,
          },
        };

    const prompt = `Eres Alis, asistente pedagógico para docentes en Perú.
Analiza la evidencia académica del alumno y responde SOLO JSON válido (sin markdown).

Alumno: ${student.name}
Grado: ${student.grade || ""}
Materia: ${student.subject || student.subjectId || ""}
Enfoque actual: ${student.focus || "no definido"}

Referencia CNEB:
- Competencia: ${cneb?.competence || "no disponible"}
- Capacidad: ${cneb?.capacity || "no disponible"}
- Desempeño esperado: ${cneb?.performance || "no disponible"}

Devuelve este JSON exacto:
{
  "score": number|null,
  "status": "riesgo"|"atencion"|"normal"|"destacado",
  "topicTitle": string,
  "cnebCompetence": string|null,
  "cnebPerformance": string|null,
  "obs": [{"ok": boolean, "t": string}],
  "next": string,
  "summary": string,
  "gaps": [string],
  "learningPath": {
    "estimate": number,
    "goal": string,
    "sessions": [
      {
        "id": string,
        "order": number,
        "title": string,
        "why": string,
        "kind": "diagnostico"|"puente"|"meta",
        "status": "done"|"current"|"pending"
      }
    ]
  }
}

Reglas:
- score 0-100 si puedes estimar; si no, null.
- status según desempeño vs CNEB.
- obs: 3 a 5 puntos concretos (aciertos y errores).
- next: sugerencia breve de refuerzo alineada al CNEB.
- gaps: 1 a 3 prerequisitos que le faltan (más básicos que el tema de la tarea).
- learningPath: línea de sesiones de lo MÁS FÁCIL / básico hacia la META.
  - Sesión 1 kind=diagnostico status=done (punto de partida de la evidencia).
  - Luego 1–3 kind=puente (prerequisitos; nunca saltes directo a la meta si hay huecos).
  - Última kind=meta = el objetivo de la tarea o CNEB (lo más difícil de esta ruta).
  - Si el alumno no sabe sumar y la tarea era multiplicación: puentes de suma/resta ANTES de multiplicación.
  - estimate = cantidad de sesiones de la ruta.
- Sé honesto si la imagen es ilegible.`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1800,
        messages: [
          {
            role: "user",
            content: [
              contentBlock,
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    const aiJson = await aiRes.json();
    if (!aiRes.ok) {
      console.error("Anthropic error", aiJson);
      return json({ error: "Anthropic: " + (aiJson?.error?.message || aiRes.statusText) }, 502);
    }

    const text = (aiJson.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
    let analysis;
    try {
      const clean = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
      analysis = JSON.parse(clean);
    } catch {
      analysis = {
        score: null,
        status: "atencion",
        topicTitle: cneb?.capacity || student.focus || "Evidencia",
        cnebCompetence: cneb?.competence || null,
        cnebPerformance: cneb?.performance || null,
        obs: [{ ok: false, t: "No se pudo parsear la respuesta de la IA." }, { ok: true, t: text.slice(0, 400) }],
        next: "Revisar la evidencia manualmente y generar refuerzo.",
        summary: text.slice(0, 500),
      };
    }

    analysis.cnebCompetence = analysis.cnebCompetence || cneb?.competence || null;
    analysis.cnebPerformance = analysis.cnebPerformance || cneb?.performance || null;

    if (evidenceId) {
      await supabase
        .from("evidence")
        .update({ status: "analyzed", analysis })
        .eq("id", evidenceId);
    }

    return json({ analysis });
  } catch (err) {
    console.error(err);
    return json({ error: err.message || "Error interno" }, 500);
  }
});
