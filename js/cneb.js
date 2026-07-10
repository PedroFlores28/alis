// cneb.js — base curricular mínima (CNEB) + helpers

const CNEB_FALLBACK = [
  { id: "mate-1-resuelve", subjectId: "mate", grade: "1° Secundaria", competence: "Resuelve problemas de cantidad", capacity: "Traduce cantidades a expresiones numéricas", performance: "Resuelve problemas con números naturales, enteros y operaciones básicas." },
  { id: "mate-2-resuelve", subjectId: "mate", grade: "2° Secundaria", competence: "Resuelve problemas de cantidad", capacity: "Usa fracciones, razones y proporciones", performance: "Resuelve problemas con fracciones, decimales y proporcionalidad." },
  { id: "mate-3-resuelve", subjectId: "mate", grade: "3° Secundaria", competence: "Resuelve problemas de regularidad, equivalencia y cambio", capacity: "Modela con ecuaciones y funciones", performance: "Plantea y resuelve ecuaciones y relaciones funcionales simples." },
  { id: "ing-1-comunica", subjectId: "ingles", grade: "1° Secundaria", competence: "Se comunica oralmente en inglés", capacity: "Obtiene información del interlocutor", performance: "Comprende y produce mensajes orales simples sobre sí mismo y su entorno." },
  { id: "ing-2-lee", subjectId: "ingles", grade: "2° Secundaria", competence: "Lee diversos tipos de textos en inglés", capacity: "Obtiene información del texto escrito", performance: "Comprende textos cortos e identifica idea principal y detalles." },
  { id: "ing-3-escribe", subjectId: "ingles", grade: "3° Secundaria", competence: "Escribe diversos tipos de textos en inglés", capacity: "Organiza y desarrolla ideas en torno a un tema", performance: "Produce textos coherentes con conectores y vocabulario adecuado al grado." },
  { id: "com-1-lee", subjectId: "comunicacion", grade: "1° Secundaria", competence: "Lee diversos tipos de textos en lengua materna", capacity: "Obtiene información del texto escrito", performance: "Identifica información explícita e idea principal en textos descriptivos." },
  { id: "com-2-escribe", subjectId: "comunicacion", grade: "2° Secundaria", competence: "Escribe diversos tipos de textos en lengua materna", capacity: "Organiza y desarrolla ideas", performance: "Produce textos narrativos con estructura clara (inicio, nudo, desenlace)." },
  { id: "com-3-lee", subjectId: "comunicacion", grade: "3° Secundaria", competence: "Lee diversos tipos de textos en lengua materna", capacity: "Infiere e interpreta información", performance: "Analiza textos argumentativos e identifica punto de vista y argumentos." },
];

function mapCneb(row) {
  return {
    id: row.id,
    subjectId: row.subject_id || row.subjectId,
    grade: row.grade,
    competence: row.competence,
    capacity: row.capacity,
    performance: row.performance,
  };
}

async function loadCneb() {
  const client = window.supabaseClient;
  if (client) {
    const { data, error } = await client.from("cneb_items").select("*").order("grade");
    if (!error && data?.length) {
      window.CNEB = data.map(mapCneb);
      return window.CNEB;
    }
  }
  window.CNEB = CNEB_FALLBACK.slice();
  return window.CNEB;
}

/** Competencia CNEB para materia + grado del alumno */
function cnebForStudent(student) {
  const list = window.CNEB || CNEB_FALLBACK;
  if (!student) return null;
  return (
    list.find((c) => c.subjectId === student.subjectId && c.grade === student.grade) ||
    list.find((c) => c.subjectId === student.subjectId) ||
    null
  );
}

function buildEvidenceAnalysis(student, fileName) {
  const cneb = cnebForStudent(student);
  return {
    score: null,
    status: "atencion",
    topicTitle: cneb ? cneb.capacity : student.focus || "Evidencia recibida",
    cnebId: cneb?.id || null,
    cnebCompetence: cneb?.competence || null,
    cnebPerformance: cneb?.performance || null,
    obs: [
      { ok: true, t: `Evidencia guardada: ${fileName}` },
      {
        ok: !!cneb,
        t: cneb
          ? `Referencia CNEB (${student.grade}): ${cneb.competence} — ${cneb.capacity}.`
          : "No hay ítem CNEB para este grado/materia.",
      },
      {
        ok: false,
        t: "OCR/IA de respuestas aún no activo: este análisis es curricular (referencia), no lectura automática del archivo.",
      },
    ],
    next: cneb
      ? `Generar práctica alineada a: ${cneb.capacity}`
      : `Generar refuerzo sobre: ${student.focus || "el tema actual"}`,
  };
}

Object.assign(window, {
  CNEB_FALLBACK,
  loadCneb,
  cnebForStudent,
  buildEvidenceAnalysis,
});
