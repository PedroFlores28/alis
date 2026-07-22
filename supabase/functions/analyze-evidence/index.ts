// Supabase Edge Function: analyze-evidence
// Secret requerido: OPENAI_API_KEY
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

function extractOpenAIText(aiJson) {
  const content = aiJson?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join("\n");
  }
  return "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) return json({ error: "Falta OPENAI_API_KEY en Secrets" }, 500);

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
    const safeMime = mediaType.startsWith("image/")
      ? mediaType
      : isPdf
        ? "application/pdf"
        : "image/jpeg";

    const prompt = `Eres Alis, asistente pedagógico para docentes en Perú (CNEB/MINEDU).
Analiza la evidencia académica del alumno y responde SOLO JSON válido (sin markdown).

IMPORTANTE sobre gráficos/figuras:
- NO intentes redibujar, regenerar ni inventar SVG/Markdown de la figura.
- Describe en texto preciso lo que ves (geometría, mapas conceptuales, viñetas, diagramas, tablas, etc.).
- El docente debe entender a qué material hace referencia el alumno y dónde se equivocó, solo leyendo texto.

Estructura el análisis en 3 etapas:
1) Reconocimiento y descripción del elemento gráfico / material visto.
2) Identificación del objetivo pedagógico o pregunta del ejercicio.
3) Diagnóstico paso a paso del desempeño del alumno (aciertos y errores).

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
  "graphicDescription": string,
  "graphicElements": [string],
  "exerciseGoal": string,
  "studentDiagnosis": {
    "strengths": [string],
    "errors": [string],
    "summary": string
  },
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
- graphicDescription: párrafo claro de lo que aparece en la imagen (figura, etiquetas, datos visibles).
- graphicElements: 2 a 8 elementos detectados (ej. "triángulo isósceles", "ángulo 14°", "personaje A").
- exerciseGoal: qué pedía el ejercicio / objetivo pedagógico.
- studentDiagnosis.strengths / errors: listas cortas y concretas.
- studentDiagnosis.summary: síntesis del desempeño en 1-2 oraciones.
- score 0-100 si puedes estimar; si no, null.
- status según desempeño vs CNEB.
- obs: 3 a 5 puntos concretos (aciertos y errores), coherentes con studentDiagnosis.
- next: sugerencia breve de refuerzo alineada al CNEB.
- gaps: 1 a 3 prerequisitos que le faltan (más básicos que el tema de la tarea).
- learningPath: línea de sesiones de lo MÁS FÁCIL / básico hacia la META.
  - Sesión 1 kind=diagnostico status=done (punto de partida de la evidencia).
  - Luego 1–3 kind=puente (prerequisitos; nunca saltes directo a la meta si hay huecos).
  - Última kind=meta = el objetivo de la tarea o CNEB (lo más difícil de esta ruta).
  - Si el alumno no sabe sumar y la tarea era multiplicación: puentes de suma/resta ANTES de multiplicación.
  - estimate = cantidad de sesiones de la ruta.
- Sé honesto si la imagen es ilegible.`;

    const userContent = isPdf
      ? [
          {
            type: "file",
            file: {
              filename: fileName || "evidencia.pdf",
              file_data: `data:application/pdf;base64,${b64}`,
            },
          },
          { type: "text", text: prompt },
        ]
      : [
          {
            type: "image_url",
            image_url: {
              url: `data:${safeMime};base64,${b64}`,
              detail: "high",
            },
          },
          { type: "text", text: prompt },
        ];

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + openaiKey,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 2200,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Eres Alis. Respondes únicamente JSON válido. Describes gráficos en texto preciso; nunca inventas SVG ni reconstrucciones visuales.",
          },
          {
            role: "user",
            content: userContent,
          },
        ],
      }),
    });

    const aiJson = await aiRes.json();
    if (!aiRes.ok) {
      console.error("OpenAI error", aiJson);
      return json({ error: "OpenAI: " + (aiJson?.error?.message || aiRes.statusText) }, 502);
    }

    const text = extractOpenAIText(aiJson);
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
        graphicDescription: "No se pudo estructurar la descripción visual de la evidencia.",
        graphicElements: [],
        exerciseGoal: "Revisar manualmente el objetivo del ejercicio.",
        studentDiagnosis: {
          strengths: [],
          errors: ["No se pudo parsear la respuesta de la IA."],
          summary: text.slice(0, 400),
        },
        obs: [{ ok: false, t: "No se pudo parsear la respuesta de la IA." }, { ok: true, t: text.slice(0, 400) }],
        next: "Revisar la evidencia manualmente y generar refuerzo.",
        summary: text.slice(0, 500),
        gaps: [],
      };
    }

    analysis.cnebCompetence = analysis.cnebCompetence || cneb?.competence || null;
    analysis.cnebPerformance = analysis.cnebPerformance || cneb?.performance || null;
    analysis.graphicDescription = String(analysis.graphicDescription || "").trim();
    analysis.exerciseGoal = String(analysis.exerciseGoal || "").trim();
    analysis.graphicElements = Array.isArray(analysis.graphicElements)
      ? analysis.graphicElements.map((x) => String(x).trim()).filter(Boolean)
      : [];
    const diagnosis = analysis.studentDiagnosis && typeof analysis.studentDiagnosis === "object"
      ? analysis.studentDiagnosis
      : {};
    analysis.studentDiagnosis = {
      strengths: Array.isArray(diagnosis.strengths)
        ? diagnosis.strengths.map((x) => String(x).trim()).filter(Boolean)
        : [],
      errors: Array.isArray(diagnosis.errors)
        ? diagnosis.errors.map((x) => String(x).trim()).filter(Boolean)
        : [],
      summary: String(diagnosis.summary || analysis.summary || "").trim(),
    };
    if (!analysis.summary) {
      analysis.summary = analysis.studentDiagnosis.summary || analysis.graphicDescription || "";
    }

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
