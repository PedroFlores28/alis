// Supabase Edge Function: analyze-evidence
// Secret requerido: GEMINI_API_KEY
// Modelo: gemini-3.1-flash-lite (Flash-Lite actual, económico y disponible)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_MODEL = "gemini-3.1-flash-lite";

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

function extractGeminiText(aiJson) {
  const parts = aiJson?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts.map((part) => part?.text || "").join("\n").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const geminiKey = String(Deno.env.get("GEMINI_API_KEY") || "").trim();
    if (!geminiKey) return json({ error: "Falta GEMINI_API_KEY en Secrets" }, 500);

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
      expectedPractice,
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

    if (b64.length > 6_000_000) {
      return json({ error: "Archivo demasiado grande para análisis. Usa una foto más liviana." }, 413);
    }

    const isPdf = mediaType.includes("pdf") || /\.pdf$/i.test(fileName || "");
    const safeMime = mediaType.startsWith("image/")
      ? mediaType
      : isPdf
        ? "application/pdf"
        : "image/jpeg";

    const expectedBlock = expectedPractice && (expectedPractice.title || expectedPractice.topic || expectedPractice.code)
      ? `
Práctica ALIS esperada (CRÍTICO — anti-engaño):
- Código de práctica (obligatorio en la hoja): ${expectedPractice.code || "no asignado"}
- Sesión: ${expectedPractice.sessionTitle || expectedPractice.title || ""}
- Tema: ${expectedPractice.topic || expectedPractice.title || ""}
- Por qué: ${expectedPractice.why || ""}
- Tipo material ALIS: ${expectedPractice.type || "no indicado"}
- Ejercicios de referencia: ${(Array.isArray(expectedPractice.samplePrompts) ? expectedPractice.samplePrompts : []).slice(0, 6).map((p, i) => `${i + 1}. ${p}`).join(" | ") || "—"}

Reglas de verificación:
1) Busca el código exacto (${expectedPractice.code || "ALIS-XXXX"}) en la imagen/PDF.
2) practiceCodeFound=true solo si lo ves claramente; practiceCodeSeen = el texto del código leído.
3) pathMatch="yes" SOLO si el código está presente Y el contenido corresponde a esa práctica.
4) Si el código no aparece → pathMatch="no" (aunque el tema se parezca).
5) Si es otra hoja/tarea → pathMatch="no".
`
      : `
No hay práctica ALIS generada pendiente. pathMatch="yes", practiceCodeFound=false, practiceCodeSeen="".
`;

    const prompt = `Eres Alis, asistente pedagógico para docentes en Perú (CNEB/MINEDU).
Analiza la evidencia académica del alumno y responde SOLO JSON válido (sin markdown envolvente).

PROCESO INTERNO (hazlo en este orden, pero responde solo en el JSON final):
A) Analiza y escudriña la imagen minuciosamente de arriba a abajo en orden secuencial de lectura visual.
B) Extrae todo el texto visible palabra por palabra respetando su orden y estructura espacial.
C) Si encuentras gráfico, diagrama, tabla, esquema, figura o mapa, pausa en ese punto y descríbelo con detalle (tipo, ejes/etiquetas, datos, tendencias, contenido y significado visual). NO redibujes ni inventes SVG.
D) Busca el código de práctica ALIS-XXXX si se indicó uno esperado.
E) Diagnostica el desempeño del alumno y decide pathMatch.

IMPORTANTE:
- Un solo prompt general (sirve para cualquier área/curso).
- El tutor verá un resumen claro; el campo documentMarkdown es la transcripción interna completa.
- Sé honesto si la imagen es ilegible.
- Sin el código de práctica esperado, pathMatch debe ser "no".

Alumno: ${student.name}
Grado: ${student.grade || ""}
Materia: ${student.subject || student.subjectId || ""}
Enfoque actual: ${student.focus || "no definido"}

Referencia CNEB:
- Competencia: ${cneb?.competence || "no disponible"}
- Capacidad: ${cneb?.capacity || "no disponible"}
- Desempeño esperado: ${cneb?.performance || "no disponible"}
${expectedBlock}
Devuelve este JSON exacto:
{
  "documentMarkdown": string,
  "score": number|null,
  "status": "riesgo"|"atencion"|"normal"|"destacado",
  "topicTitle": string,
  "cnebCompetence": string|null,
  "cnebPerformance": string|null,
  "graphicDescription": string,
  "graphicElements": [string],
  "exerciseGoal": string,
  "pathMatch": "yes"|"no"|"unsure",
  "pathMatchReason": string,
  "practiceCodeFound": boolean,
  "practiceCodeSeen": string,
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

Reglas de campos:
- practiceCodeFound / practiceCodeSeen: si aparece el código ALIS de la práctica esperada.
- pathMatch / pathMatchReason: cruce estricto con la práctica ALIS (código + contenido).
- documentMarkdown: Markdown limpio, estructurado y editable, de arriba hacia abajo, con el texto extraído y las descripciones de figuras insertadas donde aparecen. Compacto pero completo.
- graphicDescription: resumen corto de la(s) figura(s) principal(es) para el tutor.
- graphicElements: 2 a 8 elementos detectados (ej. "triángulo isósceles", "ángulo 14°").
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
  - Última kind=meta = el objetivo de la tarea o CNEB.
  - Si el alumno no sabe sumar y la tarea era multiplicación: puentes de suma/resta ANTES de multiplicación.
  - estimate = cantidad de sesiones de la ruta.`;

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": geminiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { inline_data: { mime_type: safeMime, data: b64 } },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2800,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const aiJson = await aiRes.json();
    if (!aiRes.ok) {
      console.error("Gemini error", aiJson);
      return json({ error: "Gemini: " + (aiJson?.error?.message || aiRes.statusText) }, 502);
    }

    const text = extractGeminiText(aiJson);
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
        documentMarkdown: text.slice(0, 2000),
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
    analysis.documentMarkdown = String(analysis.documentMarkdown || "").trim();
    analysis.graphicDescription = String(analysis.graphicDescription || "").trim();
    analysis.exerciseGoal = String(analysis.exerciseGoal || "").trim();
    const rawMatch = String(analysis.pathMatch || "").toLowerCase().trim();
    analysis.pathMatch = rawMatch === "yes" || rawMatch === "si" || rawMatch === "sí"
      ? "yes"
      : rawMatch === "no"
        ? "no"
        : rawMatch === "unsure" || rawMatch === "dudoso" || rawMatch === "parcial"
          ? "unsure"
          : (expectedPractice ? "unsure" : "yes");
    analysis.pathMatchReason = String(analysis.pathMatchReason || "").trim();
    analysis.practiceCodeFound = analysis.practiceCodeFound === true;
    analysis.practiceCodeSeen = String(analysis.practiceCodeSeen || "").trim();
    if (!analysis.graphicDescription && analysis.documentMarkdown) {
      analysis.graphicDescription = analysis.documentMarkdown.slice(0, 400);
    }
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
