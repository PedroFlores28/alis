// Supabase Edge Function: generate-material
// Secret requerido: ANTHROPIC_API_KEY
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) return json({ error: "Falta ANTHROPIC_API_KEY en Secrets" }, 500);

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

    const focusHints = [
      student.focus,
      analysis?.next,
      analysis?.topicTitle,
      ...(Array.isArray(analysis?.obs) ? analysis.obs.filter((o) => o && o.ok === false).map((o) => o.t) : []),
    ].filter(Boolean).slice(0, 6).join("\n- ");

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
- "answer" breve para el docente (clave o resultado).
- Gradúa dificultad si difficulty=graduada.
- Alinea al CNEB cuando sea posible.
- teacherNotes: 1-2 frases de cómo usar el material.`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 3500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const aiJson = await aiRes.json();
    if (!aiRes.ok) {
      console.error("Anthropic error", aiJson);
      return json({ error: "Anthropic: " + (aiJson?.error?.message || aiRes.statusText) }, 502);
    }

    const text = (aiJson.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
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
