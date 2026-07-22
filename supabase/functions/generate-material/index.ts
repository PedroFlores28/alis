// Supabase Edge Function: generate-material
// Secret requerido: OPENAI_API_KEY
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
      student,
      cneb,
      type = "practica",
      difficulty = "graduada",
      count = 8,
      analysis,
    } = body || {};

    if (!student?.name) return json({ error: "Falta datos del alumno" }, 400);

    const n = Math.min(16, Math.max(4, Number(count) || 8));
    const typeLabel = { practica: "práctica", quiz: "quiz", reto: "reto" }[type] || "práctica";
    const diffLabel = { facil: "fácil", graduada: "graduada", avanzada: "avanzada" }[difficulty] || "graduada";

    const diagnosis = analysis?.studentDiagnosis || {};
    const focusHints = [
      student.focus,
      analysis?.next,
      analysis?.topicTitle,
      analysis?.exerciseGoal,
      analysis?.graphicDescription,
      diagnosis.summary,
      ...(Array.isArray(diagnosis.errors) ? diagnosis.errors : []),
      ...(Array.isArray(analysis?.obs) ? analysis.obs.filter((o) => o && o.ok === false).map((o) => o.t) : []),
    ].filter(Boolean).slice(0, 8).join("\n- ");

    const prompt = `Eres Alis, asistente pedagógico para docentes en Perú (CNEB/MINEDU).
Genera material de refuerzo REAL y usable en clase. Responde SOLO JSON válido (sin markdown).

Alumno: ${student.name}
Grado: ${student.grade || ""}
Materia: ${student.subject || student.subjectId || ""}
Enfoque del alumno: ${student.focus || "no definido"}

Referencia CNEB:
- Competencia: ${cneb?.competence || "no disponible"}
- Capacidad: ${cneb?.capacity || "no disponible"}
- Desempeño: ${cneb?.performance || "no disponible"}

Contexto de análisis previo (si hay):
- ${focusHints || "sin análisis previo; usa el enfoque del alumno"}

Pedido:
- Tipo: ${typeLabel}
- Dificultad: ${diffLabel}
- Cantidad exacta de ejercicios: ${n}

Devuelve este JSON exacto:
{
  "title": string,
  "topic": string,
  "type": "${type}",
  "difficulty": "${difficulty}",
  "exercises": [{"n": number, "prompt": string, "answer": string}],
  "teacherNotes": string
}

Reglas:
- Exactamente ${n} ejercicios en "exercises", numerados 1..${n}.
- Enunciados claros, en español, nivel ${student.grade || "secundaria"}.
- Si el tema es Pitágoras/geometría/álgebra, incluye números concretos.
- Describe figuras en texto dentro del enunciado (no SVG ni dibujos).
- "answer" breve para el docente (clave o resultado).
- Gradúa dificultad si difficulty=graduada.
- Alinea al CNEB cuando sea posible.
- Prioriza reforzar los errores del diagnóstico previo.
- teacherNotes: 1-2 frases de cómo usar el material.`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + openaiKey,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 3500,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Eres Alis. Respondes únicamente JSON válido con material pedagógico usable en clase.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const aiJson = await aiRes.json();
    if (!aiRes.ok) {
      console.error("OpenAI error", aiJson);
      return json({ error: "OpenAI: " + (aiJson?.error?.message || aiRes.statusText) }, 502);
    }

    const text = extractOpenAIText(aiJson);
    let material;
    try {
      const clean = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
      material = JSON.parse(clean);
    } catch {
      return json({ error: "No se pudo parsear el material generado.", raw: text.slice(0, 500) }, 502);
    }

    if (!Array.isArray(material.exercises) || !material.exercises.length) {
      return json({ error: "La IA no devolvió ejercicios." }, 502);
    }

    material.title = material.title || `Refuerzo · ${student.focus || "tema"}`;
    material.topic = material.topic || student.focus || "Tema";
    material.type = type;
    material.difficulty = difficulty;
    material.exercises = material.exercises.slice(0, n).map((ex, i) => ({
      n: ex.n || i + 1,
      prompt: String(ex.prompt || "").trim(),
      answer: String(ex.answer || "").trim(),
    })).filter((ex) => ex.prompt);

    if (!material.exercises.length) return json({ error: "Ejercicios vacíos." }, 502);

    return json({ material });
  } catch (err) {
    console.error(err);
    return json({ error: err.message || "Error interno" }, 500);
  }
});
