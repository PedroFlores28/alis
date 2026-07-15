// cneb.js — competencias MINEDU (CNEB) completas + helpers
// Catálogo: 29 competencias nacionales, agrupadas por área curricular.

const COMPETENCIES = [
  // DPCC
  {
    id: "c1", code: 1, subjectId: "dpcc", short: "Identidad",
    competence: "Construye su identidad",
    capacity: "Se valora a sí mismo y autorregula emociones",
    performance: "Construye una imagen positiva de sí y actúa con autonomía ética.",
  },
  {
    id: "c16", code: 16, subjectId: "dpcc", short: "Convivencia",
    competence: "Convive y participa democráticamente en la búsqueda del bien común",
    capacity: "Interactúa con los demás y deliberar sobre asuntos públicos",
    performance: "Participa en la convivencia democrática y el bien común.",
  },

  // Educación Física
  {
    id: "c2", code: 2, subjectId: "edufisica", short: "Motricidad",
    competence: "Se desenvuelve de manera autónoma a través de su motricidad",
    capacity: "Comprende y aplica habilidades motrices",
    performance: "Se expresa y organiza su movimiento con autonomía.",
  },
  {
    id: "c3", code: 3, subjectId: "edufisica", short: "Vida saludable",
    competence: "Asume una vida saludable",
    capacity: "Incorpora prácticas saludables",
    performance: "Cuida su bienestar físico y hábitos de vida saludable.",
  },
  {
    id: "c4", code: 4, subjectId: "edufisica", short: "Sociomotricidad",
    competence: "Interactúa a través de sus habilidades sociomotrices",
    capacity: "Se relaciona mediante el juego y el deporte",
    performance: "Participa en actividades físicas cooperativas y competitivas.",
  },

  // Arte y Cultura
  {
    id: "c5", code: 5, subjectId: "arte", short: "Aprecia el arte",
    competence: "Aprecia de manera crítica manifestaciones artístico-culturales",
    capacity: "Percibe, interpreta y valora el arte",
    performance: "Analiza manifestaciones artístico-culturales de su entorno.",
  },
  {
    id: "c6", code: 6, subjectId: "arte", short: "Crea con arte",
    competence: "Crea proyectos desde los lenguajes artísticos",
    capacity: "Explora y produce con lenguajes artísticos",
    performance: "Crea y presenta proyectos artísticos.",
  },

  // Comunicación — lengua materna
  {
    id: "c7", code: 7, subjectId: "comunicacion", short: "Oral",
    competence: "Se comunica oralmente en su lengua materna",
    capacity: "Obtiene, interpreta y produce información oral",
    performance: "Comprende y produce mensajes orales adecuados al propósito comunicativo.",
  },
  {
    id: "c8", code: 8, subjectId: "comunicacion", short: "Lectura",
    competence: "Lee diversos tipos de textos escritos en su lengua materna",
    capacity: "Obtiene e interpreta información del texto escrito",
    performance: "Comprende textos diversos e identifica idea principal, detalles e inferencias.",
  },
  {
    id: "c9", code: 9, subjectId: "comunicacion", short: "Escritura",
    competence: "Escribe diversos tipos de textos en su lengua materna",
    capacity: "Organiza y desarrolla ideas en torno a un tema",
    performance: "Produce textos coherentes con estructura y propósito claros.",
  },

  // Castellano como segunda lengua
  {
    id: "c10", code: 10, subjectId: "castellano2", short: "Oral C2",
    competence: "Se comunica oralmente en castellano como segunda lengua",
    capacity: "Comprende y produce mensajes orales en castellano",
    performance: "Se comunica oralmente en castellano en situaciones cotidianas.",
  },
  {
    id: "c11", code: 11, subjectId: "castellano2", short: "Lectura C2",
    competence: "Lee textos escritos en castellano como segunda lengua",
    capacity: "Obtiene información de textos en castellano",
    performance: "Comprende textos escritos en castellano como segunda lengua.",
  },
  {
    id: "c12", code: 12, subjectId: "castellano2", short: "Escritura C2",
    competence: "Escribe diversos tipos de textos en castellano como segunda lengua",
    capacity: "Organiza ideas y escribe en castellano",
    performance: "Produce textos escritos en castellano como segunda lengua.",
  },

  // Inglés
  {
    id: "c13", code: 13, subjectId: "ingles", short: "Oral EN",
    competence: "Se comunica oralmente en inglés como lengua extranjera",
    capacity: "Obtiene información del interlocutor y produce mensajes",
    performance: "Comprende y produce mensajes orales simples en inglés.",
  },
  {
    id: "c14", code: 14, subjectId: "ingles", short: "Lectura EN",
    competence: "Lee diversos tipos de textos escritos en inglés como lengua extranjera",
    capacity: "Obtiene información del texto escrito",
    performance: "Comprende textos cortos e identifica idea principal y detalles.",
  },
  {
    id: "c15", code: 15, subjectId: "ingles", short: "Escritura EN",
    competence: "Escribe diversos tipos de textos en inglés como lengua extranjera",
    capacity: "Organiza y desarrolla ideas en torno a un tema",
    performance: "Produce textos coherentes en inglés con conectores y vocabulario adecuado.",
  },

  // Ciencias Sociales
  {
    id: "c17", code: 17, subjectId: "ccss", short: "Historia",
    competence: "Construye interpretaciones históricas",
    capacity: "Interpreta críticamente fuentes y procesos históricos",
    performance: "Explica hechos y procesos históricos de manera argumentada.",
  },
  {
    id: "c18", code: 18, subjectId: "ccss", short: "Espacio y ambiente",
    competence: "Gestiona responsablemente el espacio y el ambiente",
    capacity: "Comprende el espacio geográfico y su manejo sostenible",
    performance: "Propone acciones responsables sobre el espacio y el ambiente.",
  },
  {
    id: "c19", code: 19, subjectId: "ccss", short: "Economía",
    competence: "Gestiona responsablemente los recursos económicos",
    capacity: "Comprende fenómenos económicos y toma decisiones",
    performance: "Analiza el uso responsable de recursos económicos.",
  },

  // Ciencia y Tecnología
  {
    id: "c20", code: 20, subjectId: "cyt", short: "Indagación",
    competence: "Indaga mediante métodos científicos para construir sus conocimientos",
    capacity: "Plantea preguntas e indaga con método científico",
    performance: "Realiza indagaciones para construir conocimiento científico.",
  },
  {
    id: "c21", code: 21, subjectId: "cyt", short: "Mundo físico",
    competence: "Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo",
    capacity: "Comprende fenómenos del mundo físico y vivo",
    performance: "Explica fenómenos naturales con base científica.",
  },
  {
    id: "c22", code: 22, subjectId: "cyt", short: "Tecnología",
    competence: "Diseña y construye soluciones tecnológicas para resolver problemas de su entorno",
    capacity: "Diseña y evalúa soluciones tecnológicas",
    performance: "Propone y construye soluciones tecnológicas a problemas reales.",
  },

  // Matemática
  {
    id: "c23", code: 23, subjectId: "mate", short: "Cantidad",
    competence: "Resuelve problemas de cantidad",
    capacity: "Traduce cantidades a expresiones numéricas y usa operaciones",
    performance: "Resuelve problemas con números, fracciones, razones y proporciones según el nivel del alumno.",
  },
  {
    id: "c24", code: 24, subjectId: "mate", short: "Regularidad y cambio",
    competence: "Resuelve problemas de regularidad, equivalencia y cambio",
    capacity: "Modela con ecuaciones, patrones y funciones",
    performance: "Plantea y resuelve relaciones de equivalencia y cambio en situaciones diversas.",
  },
  {
    id: "c25", code: 25, subjectId: "mate", short: "Datos e incertidumbre",
    competence: "Resuelve problemas de gestión de datos e incertidumbre",
    capacity: "Representa datos y analiza incertidumbre",
    performance: "Interpreta tablas, gráficos y situaciones de probabilidad simples.",
  },
  {
    id: "c26", code: 26, subjectId: "mate", short: "Forma y movimiento",
    competence: "Resuelve problemas de forma, movimiento y localización",
    capacity: "Orienta y describe formas en el espacio",
    performance: "Resuelve problemas de geometría, medidas y localización.",
  },

  // Educación para el Trabajo
  {
    id: "c27", code: 27, subjectId: "ept", short: "Emprendimiento",
    competence: "Gestiona proyectos de emprendimiento económico o social",
    capacity: "Planifica y gestiona proyectos de emprendimiento",
    performance: "Desarrolla proyectos de emprendimiento económico o social.",
  },

  // Educación para el Trabajo / TIC (también transversal)
  {
    id: "c28", code: 28, subjectId: "tic", short: "Entornos virtuales",
    competence: "Se desenvuelve en los entornos virtuales generados por las TIC",
    capacity: "Usa de forma ética y critica entornos digitales",
    performance: "Participa y produce en entornos virtuales de aprendizaje.",
  },

  // Tutoría / transversal
  {
    id: "c29", code: 29, subjectId: "tutoria", short: "Aprende a aprender",
    competence: "Gestiona su aprendizaje de manera autónoma",
    capacity: "Organiza, monitorea y evalúa su propio aprendizaje",
    performance: "Define metas de aprendizaje y regula su progreso.",
  },
];

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
  window.CNEB = COMPETENCIES.map((c) => ({ ...c, grade: null }));
  return window.CNEB;
}

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
