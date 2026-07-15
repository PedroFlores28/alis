// cneb.js — competencias MINEDU (CNEB) + helpers
// La navegación es por COMPETENCIA, no por grado escolar.

const COMPETENCIES = [
  // Matemática (23–26)
  {
    id: "c23",
    code: 23,
    subjectId: "mate",
    short: "Cantidad",
    competence: "Resuelve problemas de cantidad",
    capacity: "Traduce cantidades a expresiones numéricas y usa operaciones",
    performance: "Resuelve problemas con números, fracciones, razones y proporciones según el nivel del alumno.",
  },
  {
    id: "c24",
    code: 24,
    subjectId: "mate",
    short: "Regularidad y cambio",
    competence: "Resuelve problemas de regularidad, equivalencia y cambio",
    capacity: "Modela con ecuaciones, patrones y funciones",
    performance: "Plantea y resuelve relaciones de equivalencia y cambio en situaciones diversas.",
  },
  {
    id: "c25",
    code: 25,
    subjectId: "mate",
    short: "Datos e incertidumbre",
    competence: "Resuelve problemas de gestión de datos e incertidumbre",
    capacity: "Representa datos y analiza incertidumbre",
    performance: "Interpreta tablas, gráficos y situaciones de probabilidad simples.",
  },
  {
    id: "c26",
    code: 26,
    subjectId: "mate",
    short: "Forma y movimiento",
    competence: "Resuelve problemas de forma, movimiento y localización",
    capacity: "Orienta y describe formas en el espacio",
    performance: "Resuelve problemas de geometría, medidas y localización.",
  },
  // Comunicación — lengua materna (7–9)
  {
    id: "c7",
    code: 7,
    subjectId: "comunicacion",
    short: "Oral",
    competence: "Se comunica oralmente en su lengua materna",
    capacity: "Obtiene, interpreta y produce información oral",
    performance: "Comprende y produce mensajes orales adecuados al propósito comunicativo.",
  },
  {
    id: "c8",
    code: 8,
    subjectId: "comunicacion",
    short: "Lectura",
    competence: "Lee diversos tipos de textos escritos en su lengua materna",
    capacity: "Obtiene e interpreta información del texto escrito",
    performance: "Comprende textos diversos e identifica idea principal, detalles e inferencias.",
  },
  {
    id: "c9",
    code: 9,
    subjectId: "comunicacion",
    short: "Escritura",
    competence: "Escribe diversos tipos de textos en su lengua materna",
    capacity: "Organiza y desarrolla ideas en torno a un tema",
    performance: "Produce textos coherentes con estructura y propósito claros.",
  },
  // Inglés (13–15)
  {
    id: "c13",
    code: 13,
    subjectId: "ingles",
    short: "Oral EN",
    competence: "Se comunica oralmente en inglés como lengua extranjera",
    capacity: "Obtiene información del interlocutor y produce mensajes",
    performance: "Comprende y produce mensajes orales simples en inglés.",
  },
  {
    id: "c14",
    code: 14,
    subjectId: "ingles",
    short: "Lectura EN",
    competence: "Lee diversos tipos de textos escritos en inglés como lengua extranjera",
    capacity: "Obtiene información del texto escrito",
    performance: "Comprende textos cortos e identifica idea principal y detalles.",
  },
  {
    id: "c15",
    code: 15,
    subjectId: "ingles",
    short: "Escritura EN",
    competence: "Escribe diversos tipos de textos en inglés como lengua extranjera",
    capacity: "Organiza y desarrolla ideas en torno a un tema",
    performance: "Produce textos coherentes en inglés con conectores y vocabulario adecuado.",
  },
];

/** Compat: lista plana estilo CNEB_FALLBACK (usa competencia, no grado) */
const CNEB_FALLBACK = COMPETENCIES.map((c) => ({
  id: c.id,
  subjectId: c.subjectId,
  grade: null,
  competence: c.competence,
  capacity: c.capacity,
  performance: c.performance,
  code: c.code,
  short: c.short,
}));

function mapCneb(row) {
  return {
    id: row.id,
    subjectId: row.subject_id || row.subjectId,
    grade: row.grade || null,
    competence: row.competence,
    capacity: row.capacity,
    performance: row.performance,
    code: row.code || null,
    short: row.short || null,
  };
}

function competenciesOf(subjectId) {
  return (window.COMPETENCIES || COMPETENCIES).filter((c) => c.subjectId === subjectId);
}

function competenceById(id) {
  if (!id) return null;
  return (window.COMPETENCIES || COMPETENCIES).find((c) => c.id === id) || null;
}

function defaultCompetenceId(subjectId) {
  const list = competenciesOf(subjectId);
  return list[0] ? list[0].id : null;
}

function studentCompetenceLabel(student) {
  const c = competenceById(student?.competenceId) || cnebForStudent(student);
  if (!c) return student?.subject || "Sin competencia";
  return "C" + (c.code || "") + " · " + (c.short || c.competence);
}

async function loadCneb() {
  const client = window.supabaseClient;
  if (client) {
    const { data, error } = await client.from("cneb_items").select("*");
    if (!error && data?.length) {
      // Preferimos el catálogo local MINEDU; DB solo si ya tiene competence_id alineados
      window.CNEB = COMPETENCIES.map((c) => ({ ...c, grade: null }));
      return window.CNEB;
    }
  }
  window.CNEB = COMPETENCIES.map((c) => ({ ...c, grade: null }));
  return window.CNEB;
}

/** Competencia MINEDU del alumno (por competenceId, con fallback por área) */
function cnebForStudent(student) {
  if (!student) return null;
  if (student.competenceId) {
    const byId = competenceById(student.competenceId);
    if (byId) return byId;
  }
  const list = window.COMPETENCIES || COMPETENCIES;
  return list.find((c) => c.subjectId === student.subjectId) || null;
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
          ? `Referencia CNEB (Competencia ${cneb.code}): ${cneb.competence} — ${cneb.capacity}.`
          : "No hay competencia CNEB asignada a este alumno.",
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
  COMPETENCIES,
  CNEB_FALLBACK,
  loadCneb,
  cnebForStudent,
  buildEvidenceAnalysis,
  competenciesOf,
  competenceById,
  defaultCompetenceId,
  studentCompetenceLabel,
  mapCneb,
});
