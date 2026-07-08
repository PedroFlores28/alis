// data.jsx — subjects, students (scoped by subject), material bank + line icons
const Icon = ({ name, size = 20, stroke = 1.6, style }) => {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    students: <><circle {...p} cx="8.5" cy="8" r="3" /><path {...p} d="M3 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path {...p} d="M16 6.2a3 3 0 0 1 0 5.6" /><path {...p} d="M17.5 14.2c2 .7 3.5 2.5 3.5 4.8" /></>,
    book: <><path {...p} d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2z" /><path {...p} d="M4 19.5A1.5 1.5 0 0 1 5.5 18H20" /><path {...p} d="M8 8h7" /></>,
    bank: <><path {...p} d="M12 3 21 7.5 12 12 3 7.5 12 3Z" /><path {...p} d="M3 12l9 4.5L21 12" /><path {...p} d="M3 16.5 12 21l9-4.5" /></>,
    settings: <><circle {...p} cx="12" cy="12" r="3" /><path {...p} d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.5 1.5M6.8 17.2l-1.5 1.5M18.7 18.7l-1.5-1.5M6.8 6.8 5.3 5.3" /></>,
    upload: <><path {...p} d="M12 16V4" /><path {...p} d="m7.5 8.5 4.5-4.5 4.5 4.5" /><path {...p} d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" /></>,
    sparkles: <><path {...p} d="M12 3.5 13.6 9 19 10.5 13.6 12 12 17.5 10.4 12 5 10.5 10.4 9 12 3.5Z" /><path {...p} d="M18.5 4.5 19 6l1.5.5L19 7l-.5 1.5L18 7l-1.5-.5L18 6z" /><path {...p} d="M5 15.5 5.4 17l1.6.5L5.4 18 5 19.5 4.6 18 3 17.5 4.6 17z" /></>,
    search: <><circle {...p} cx="11" cy="11" r="6.5" /><path {...p} d="m20 20-3.7-3.7" /></>,
    bell: <><path {...p} d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 7h16c0-1-2-2-2-7" /><path {...p} d="M10 20a2 2 0 0 0 4 0" /></>,
    plus: <><path {...p} d="M12 5v14M5 12h14" /></>,
    chevron: <><path {...p} d="m9 6 6 6-6 6" /></>,
    chevronDown: <><path {...p} d="m6 9 6 6 6-6" /></>,
    arrowUpRight: <><path {...p} d="M7 17 17 7" /><path {...p} d="M8 7h9v9" /></>,
    calendar: <><rect {...p} x="3.5" y="5" width="17" height="15" rx="2" /><path {...p} d="M3.5 9.5h17M8 3.5v3M16 3.5v3" /></>,
    clock: <><circle {...p} cx="12" cy="12" r="8.5" /><path {...p} d="M12 7.5V12l3 2" /></>,
    check: <><path {...p} d="m5 12.5 4.5 4.5L19 7" /></>,
    alert: <><path {...p} d="M12 4 2.7 20h18.6z" /><path {...p} d="M12 10v4.5" /><circle cx="12" cy="17.5" r="1" fill="currentColor" stroke="none" /></>,
    file: <><path {...p} d="M6 3h8l4 4v14H6z" /><path {...p} d="M14 3v4h4" /><path {...p} d="M9 13h6M9 16.5h6" /></>,
    image: <><rect {...p} x="3.5" y="4.5" width="17" height="15" rx="2" /><circle {...p} cx="8.5" cy="9.5" r="1.8" /><path {...p} d="m4 17 4.5-4.5L13 16l3-3 4 4" /></>,
    target: <><circle {...p} cx="12" cy="12" r="8.5" /><circle {...p} cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></>,
    trending: <><path {...p} d="M3 16.5 9 10l4 4 8-8.5" /><path {...p} d="M21 9.5v-4h-4" /></>,
    message: <><path {...p} d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9A1.5 1.5 0 0 1 18.5 16H9l-4 4z" /><path {...p} d="M8 9h8M8 12h5" /></>,
    cap: <><path {...p} d="m12 4 9 4-9 4-9-4 9-4Z" /><path {...p} d="M6 9.5V14c0 1.5 2.7 3 6 3s6-1.5 6-3V9.5" /><path {...p} d="M21 8v5" /></>,
    arrowLeft: <><path {...p} d="M15 6 9 12l6 6" /></>,
    x: <><path {...p} d="m6 6 12 12M18 6 6 18" /></>,
    flag: <><path {...p} d="M5 21V4" /><path {...p} d="M5 4.5h11l-2 3.5 2 3.5H5" /></>,
    download: <><path {...p} d="M12 4v12" /><path {...p} d="m7.5 11.5 4.5 4.5 4.5-4.5" /><path {...p} d="M4 18v.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V18" /></>,
    eye: <><path {...p} d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle {...p} cx="12" cy="12" r="2.8" /></>,
    pencil: <><path {...p} d="M4 20h4L19 9l-4-4L4 16z" /><path {...p} d="m13.5 6.5 4 4" /></>,
    filter: <><path {...p} d="M3 5h18l-7 8v5l-4 2v-7z" /></>,
    // subject icons
    mate: <><rect {...p} x="4" y="4" width="16" height="16" rx="2.5" /><path {...p} d="M8 9.5h3M9.5 8v3" /><path {...p} d="M14 9.5h2.5" /><path {...p} d="M8 15h3M14 14h2.5M14 16h2.5" /></>,
    ingles: <><circle {...p} cx="12" cy="12" r="8.5" /><path {...p} d="M3.5 12h17" /><path {...p} d="M12 3.5c2.4 2.3 3.7 5.3 3.7 8.5s-1.3 6.2-3.7 8.5c-2.4-2.3-3.7-5.3-3.7-8.5S9.6 5.8 12 3.5Z" /></>,
    comunicacion: <><path {...p} d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9A1.5 1.5 0 0 1 18.5 16H9l-4 4z" /><path {...p} d="M8 9h8M8 12h5" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "block", flexShrink: 0, ...style }} aria-hidden="true">
      {paths[name] || null}
    </svg>
  );
};

const TEACHER = { name: "Ernesto Sánchez", plan: "Plan Tutor", initials: "ES" };

const SUBJECTS = [
  { id: "mate", name: "Matemática", short: "Mat.", icon: "mate" },
  { id: "ingles", name: "Inglés", short: "Ing.", icon: "ingles" },
  { id: "comunicacion", name: "Comunicación", short: "Com.", icon: "comunicacion" },
];

const STATUS = {
  riesgo: { label: "En riesgo", dot: "var(--risk)", chipBg: "var(--risk-bg)", chipInk: "var(--risk-ink)" },
  atencion: { label: "Atención", dot: "var(--attn)", chipBg: "var(--attn-bg)", chipInk: "var(--attn-ink)" },
  normal: { label: "Normal", dot: "var(--normal)", chipBg: "var(--normal-bg)", chipInk: "var(--normal-ink)" },
  destacado: { label: "Destacado", dot: "var(--good)", chipBg: "var(--good-bg)", chipInk: "var(--good-ink)" },
};

const STUDENTS = [
  // ---------- Matemática ----------
  {
    id: "javier", subjectId: "mate", name: "Javier Torres", initials: "JT", grade: "2° Secundaria", subject: "Matemática",
    progress: 45, status: "riesgo", trend: -6, avatarHue: 18, lastSession: "Hace 2 días", nextSession: "Hoy · 4:30 p.m.", sessions: 14,
    focus: "Fracciones y operaciones con decimales", note: "3 sesiones seguidas con dificultad en fracciones.",
    topics: [{ name: "Números enteros", score: 78 }, { name: "Fracciones", score: 38 }, { name: "Decimales", score: 44 }, { name: "Proporcionalidad", score: 52 }],
    history: [{ label: "Práctica de fracciones", date: "5 jun", score: 42, type: "Evaluación" }, { label: "Quiz: operaciones combinadas", date: "1 jun", score: 48, type: "Quiz" }, { label: "Tarea: decimales", date: "28 may", score: 55, type: "Tarea" }],
  },
  {
    id: "mateo", subjectId: "mate", name: "Mateo Quispe", initials: "MQ", grade: "2° Secundaria", subject: "Matemática",
    progress: 72, status: "normal", trend: 4, avatarHue: 230, lastSession: "Ayer", nextSession: "Mié · 5:00 p.m.", sessions: 19,
    focus: "Ecuaciones de primer grado", note: "Progreso constante. Mantiene el ritmo esperado.",
    topics: [{ name: "Números enteros", score: 80 }, { name: "Fracciones", score: 70 }, { name: "Ecuaciones", score: 66 }, { name: "Geometría", score: 72 }],
    history: [{ label: "Quiz: ecuaciones", date: "6 jun", score: 74, type: "Quiz" }, { label: "Práctica: geometría", date: "2 jun", score: 71, type: "Evaluación" }, { label: "Tarea: fracciones", date: "29 may", score: 68, type: "Tarea" }],
  },
  {
    id: "ana", subjectId: "mate", name: "Ana Flores", initials: "AF", grade: "1° Secundaria", subject: "Matemática",
    progress: 61, status: "atencion", trend: -2, avatarHue: 300, lastSession: "Hace 4 días", nextSession: "Vie · 4:00 p.m.", sessions: 11,
    focus: "Operaciones con números naturales", note: "Bajó el ritmo esta semana. Conviene reforzar pronto.",
    topics: [{ name: "Números naturales", score: 66 }, { name: "Múltiplos y divisores", score: 58 }, { name: "Potencias", score: 55 }, { name: "Geometría básica", score: 64 }],
    history: [{ label: "Quiz: múltiplos", date: "3 jun", score: 59, type: "Quiz" }, { label: "Tarea: potencias", date: "30 may", score: 56, type: "Tarea" }, { label: "Práctica: naturales", date: "26 may", score: 67, type: "Evaluación" }],
  },
  {
    id: "diego", subjectId: "mate", name: "Diego Ramos", initials: "DR", grade: "3° Secundaria", subject: "Matemática",
    progress: 84, status: "destacado", trend: 7, avatarHue: 200, lastSession: "Hace 2 días", nextSession: "Jue · 6:00 p.m.", sessions: 21,
    focus: "Funciones lineales y cuadráticas", note: "Rinde por encima del nivel. Listo para retos avanzados.",
    topics: [{ name: "Álgebra", score: 88 }, { name: "Funciones", score: 82 }, { name: "Geometría analítica", score: 80 }, { name: "Estadística", score: 86 }],
    history: [{ label: "Evaluación: funciones", date: "5 jun", score: 87, type: "Evaluación" }, { label: "Quiz: álgebra", date: "1 jun", score: 83, type: "Quiz" }, { label: "Reto: sistemas", date: "27 may", score: 90, type: "Reto" }],
  },
  // ---------- Inglés ----------
  {
    id: "valentina", subjectId: "ingles", name: "Valentina Cruz", initials: "VC", grade: "2° Secundaria", subject: "Inglés",
    progress: 82, status: "destacado", trend: 6, avatarHue: 160, lastSession: "Ayer", nextSession: "Mar · 5:30 p.m.", sessions: 18,
    focus: "Speaking — fluidez en presente y pasado", note: "Excelente comprensión. Lista para conversación más libre.",
    topics: [{ name: "Reading", score: 86 }, { name: "Listening", score: 84 }, { name: "Grammar", score: 78 }, { name: "Speaking", score: 80 }],
    history: [{ label: "Listening test: Unit 4", date: "6 jun", score: 85, type: "Evaluación" }, { label: "Quiz: past simple", date: "2 jun", score: 81, type: "Quiz" }, { label: "Reading: short story", date: "29 may", score: 79, type: "Tarea" }],
  },
  {
    id: "joaquin", subjectId: "ingles", name: "Joaquín Mendoza", initials: "JM", grade: "1° Secundaria", subject: "Inglés",
    progress: 53, status: "riesgo", trend: -5, avatarHue: 40, lastSession: "Hace 3 días", nextSession: "Hoy · 6:30 p.m.", sessions: 9,
    focus: "Vocabulario básico y verbo to be", note: "Le cuesta el vocabulario base. Conviene reforzar con práctica visual.",
    topics: [{ name: "Vocabulary", score: 48 }, { name: "Grammar (to be)", score: 50 }, { name: "Listening", score: 58 }, { name: "Reading", score: 56 }],
    history: [{ label: "Quiz: verb to be", date: "4 jun", score: 47, type: "Quiz" }, { label: "Vocabulary check", date: "31 may", score: 51, type: "Evaluación" }, { label: "Tarea: family words", date: "27 may", score: 55, type: "Tarea" }],
  },
  {
    id: "renata", subjectId: "ingles", name: "Renata Silva", initials: "RS", grade: "3° Secundaria", subject: "Inglés",
    progress: 69, status: "normal", trend: 3, avatarHue: 280, lastSession: "Hace 2 días", nextSession: "Vie · 5:00 p.m.", sessions: 16,
    focus: "Writing — párrafos con conectores", note: "Avance estable. Puede mejorar la producción escrita.",
    topics: [{ name: "Reading", score: 72 }, { name: "Listening", score: 70 }, { name: "Grammar", score: 68 }, { name: "Writing", score: 64 }],
    history: [{ label: "Writing: opinion text", date: "5 jun", score: 66, type: "Evaluación" }, { label: "Quiz: connectors", date: "1 jun", score: 71, type: "Quiz" }, { label: "Reading: article", date: "28 may", score: 69, type: "Tarea" }],
  },
  // ---------- Comunicación ----------
  {
    id: "lucia", subjectId: "comunicacion", name: "Lucía Paredes", initials: "LP", grade: "3° Secundaria", subject: "Comunicación",
    progress: 88, status: "destacado", trend: 9, avatarHue: 150, lastSession: "Hace 3 días", nextSession: "Jue · 3:30 p.m.", sessions: 22,
    focus: "Comprensión lectora — textos argumentativos", note: "Rendimiento sobresaliente. Lista para retos avanzados.",
    topics: [{ name: "Comprensión lectora", score: 92 }, { name: "Producción de textos", score: 85 }, { name: "Gramática", score: 88 }, { name: "Ortografía", score: 86 }],
    history: [{ label: "Ensayo argumentativo", date: "4 jun", score: 91, type: "Evaluación" }, { label: "Quiz: conectores", date: "31 may", score: 89, type: "Quiz" }, { label: "Lectura crítica", date: "27 may", score: 87, type: "Tarea" }],
  },
  {
    id: "camila", subjectId: "comunicacion", name: "Camila Ríos", initials: "CR", grade: "2° Secundaria", subject: "Comunicación",
    progress: 64, status: "atencion", trend: -3, avatarHue: 350, lastSession: "Hace 4 días", nextSession: "Mié · 4:30 p.m.", sessions: 13,
    focus: "Producción de textos narrativos", note: "Bajó su ritmo. Refuerzo en estructura de textos sugerido.",
    topics: [{ name: "Comprensión lectora", score: 70 }, { name: "Producción de textos", score: 56 }, { name: "Gramática", score: 62 }, { name: "Ortografía", score: 68 }],
    history: [{ label: "Texto narrativo", date: "3 jun", score: 58, type: "Evaluación" }, { label: "Quiz: ortografía", date: "30 may", score: 66, type: "Quiz" }, { label: "Lectura: cuento", date: "26 may", score: 67, type: "Tarea" }],
  },
  {
    id: "sebastian", subjectId: "comunicacion", name: "Sebastián Vega", initials: "SV", grade: "1° Secundaria", subject: "Comunicación",
    progress: 71, status: "normal", trend: 2, avatarHue: 110, lastSession: "Ayer", nextSession: "Vie · 3:00 p.m.", sessions: 12,
    focus: "Comprensión de textos descriptivos", note: "Progreso constante. Buen manejo de vocabulario.",
    topics: [{ name: "Comprensión lectora", score: 74 }, { name: "Producción de textos", score: 68 }, { name: "Gramática", score: 70 }, { name: "Ortografía", score: 72 }],
    history: [{ label: "Comprensión: descripción", date: "6 jun", score: 73, type: "Evaluación" }, { label: "Quiz: sustantivos", date: "2 jun", score: 70, type: "Quiz" }, { label: "Tarea: redacción", date: "29 may", score: 69, type: "Tarea" }],
  },
];

const SUGGESTIONS = [
  { id: "s1", studentId: "javier", title: "Javier necesita refuerzo en fracciones", body: "Lleva 3 sesiones con dificultad en fracciones. Te sugerimos una práctica de refuerzo de 10 ejercicios graduados.", tag: "Refuerzo", cta: "Generar práctica" },
  { id: "s2", studentId: "ana", title: "Ana bajó su ritmo esta semana", body: "Su progreso cayó 2 puntos. Una sesión corta de repaso de múltiplos podría reencauzarla.", tag: "Seguimiento", cta: "Ver sugerencia" },
  { id: "s3", studentId: "diego", title: "Diego está listo para un reto", body: "Rinde 84% en funciones. Propón un reto de sistemas de ecuaciones para mantenerlo desafiado.", tag: "Avance", cta: "Generar reto" },
  { id: "s4", studentId: "joaquin", title: "Joaquín necesita reforzar vocabulario", body: "Su vocabulario base está en 48%. Una práctica visual con flashcards puede ayudarlo a avanzar.", tag: "Refuerzo", cta: "Generar práctica" },
  { id: "s5", studentId: "valentina", title: "Valentina está lista para conversación", body: "Domina el listening (84%). Propón un ejercicio de speaking más libre sobre rutinas.", tag: "Avance", cta: "Generar reto" },
  { id: "s6", studentId: "camila", title: "Camila necesita estructura de textos", body: "Su producción escrita está en 56%. Una guía paso a paso de textos narrativos la ayudaría.", tag: "Seguimiento", cta: "Ver sugerencia" },
];

const PENDING = [
  { id: "p1", studentId: "javier", label: "Práctica de fracciones", kind: "Foto subida", time: "Hace 1 h", icon: "image" },
  { id: "p2", studentId: "mateo", label: "Quiz de ecuaciones", kind: "PDF", time: "Hace 3 h", icon: "file" },
  { id: "p3", studentId: "valentina", label: "Listening test: Unit 4", kind: "PDF", time: "Hace 2 h", icon: "file" },
  { id: "p4", studentId: "joaquin", label: "Quiz: verb to be", kind: "Foto subida", time: "Ayer", icon: "image" },
  { id: "p5", studentId: "lucia", label: "Ensayo argumentativo", kind: "PDF", time: "Ayer", icon: "file" },
  { id: "p6", studentId: "camila", label: "Texto narrativo", kind: "Foto subida", time: "Hace 5 h", icon: "image" },
];

// Banco de Material — global, ordenado por materia + nivel
const MATERIALS = [
  { id: "m1", subjectId: "mate", type: "Práctica", title: "Refuerzo de fracciones heterogéneas", level: "2° Secundaria", items: 10, date: "Hoy", isNew: true },
  { id: "m2", subjectId: "mate", type: "Quiz", title: "Operaciones combinadas", level: "2° Secundaria", items: 8, date: "Hoy", isNew: true },
  { id: "m3", subjectId: "mate", type: "Reto", title: "Sistemas de ecuaciones", level: "3° Secundaria", items: 6, date: "Hace 2 días", isNew: false },
  { id: "m4", subjectId: "mate", type: "Práctica", title: "Números naturales y potencias", level: "1° Secundaria", items: 12, date: "Hace 4 días", isNew: false },
  { id: "m5", subjectId: "ingles", type: "Práctica", title: "Vocabulary flashcards: family", level: "1° Secundaria", items: 14, date: "Ayer", isNew: true },
  { id: "m6", subjectId: "ingles", type: "Quiz", title: "Past simple — regular verbs", level: "2° Secundaria", items: 10, date: "Hace 3 días", isNew: false },
  { id: "m7", subjectId: "ingles", type: "Reto", title: "Speaking prompts: daily routines", level: "2° Secundaria", items: 8, date: "Hace 5 días", isNew: false },
  { id: "m8", subjectId: "comunicacion", type: "Práctica", title: "Estructura de textos narrativos", level: "2° Secundaria", items: 9, date: "Hace 1 día", isNew: false },
  { id: "m9", subjectId: "comunicacion", type: "Quiz", title: "Conectores lógicos", level: "3° Secundaria", items: 10, date: "Hace 6 días", isNew: false },
];

const NEW_MATERIALS = MATERIALS.filter((m) => m.isNew).length;

const byId = (id) => STUDENTS.find((s) => s.id === id);
const studentsOf = (sid) => STUDENTS.filter((s) => s.subjectId === sid);

Object.assign(window, { Icon, TEACHER, SUBJECTS, STUDENTS, STATUS, SUGGESTIONS, PENDING, MATERIALS, NEW_MATERIALS, byId, studentsOf });
