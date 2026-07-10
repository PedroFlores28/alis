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
    cap: <><path {...p} d="m12 4 9 4-9 4-9-4 9-4Z" /><path {...p} d="M6 9.5V14c0 1.5 2.7 3 6 3s6-1.5 6-3V9.5" /><path {...p} d="M21 8v5" /></>,
    arrowLeft: <><path {...p} d="M15 6 9 12l6 6" /></>,
    x: <><path {...p} d="m6 6 12 12M18 6 6 18" /></>,
    flag: <><path {...p} d="M5 21V4" /><path {...p} d="M5 4.5h11l-2 3.5 2 3.5H5" /></>,
    download: <><path {...p} d="M12 4v12" /><path {...p} d="m7.5 11.5 4.5 4.5 4.5-4.5" /><path {...p} d="M4 18v.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V18" /></>,
    eye: <><path {...p} d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle {...p} cx="12" cy="12" r="2.8" /></>,
    pencil: <><path {...p} d="M4 20h4L19 9l-4-4L4 16z" /><path {...p} d="m13.5 6.5 4 4" /></>,
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

const TEACHER = { name: "Docente", plan: "Plan Tutor", initials: "DO" };

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

// Sin alumnos demo: cada docente empieza vacío y carga los suyos desde Supabase.
const STUDENTS = [];
const SUGGESTIONS = [];
const PENDING = [];

const byId = (id) => (window.STUDENTS || STUDENTS).find((s) => s.id === id);
const studentsOf = (sid) => (window.STUDENTS || STUDENTS).filter((s) => s.subjectId === sid);

Object.assign(window, { Icon, TEACHER, SUBJECTS, STUDENTS, STATUS, SUGGESTIONS, PENDING, byId, studentsOf });
