// ruta.js — línea de tiempo de sesiones (fácil → objetivo)

function normalizeLearningPath(raw, student, analysis, cneb) {
  const goal =
    raw?.goal ||
    analysis?.topicTitle ||
    student?.focus ||
    cneb?.capacity ||
    "Objetivo de aprendizaje";

  let sessions = Array.isArray(raw?.sessions) ? raw.sessions.slice(0, 6) : [];
  sessions = sessions
    .map((s, i) => ({
      id: s.id || ("rs-" + (i + 1)),
      order: Number(s.order) || i + 1,
      title: String(s.title || "").trim() || `Sesión ${i + 1}`,
      why: String(s.why || s.reason || "").trim() || "Paso necesario hacia la meta.",
      kind: s.kind === "diagnostico" || s.kind === "meta" || s.kind === "puente" ? s.kind : (i === 0 ? "diagnostico" : "puente"),
      status: s.status === "done" || s.status === "current" || s.status === "pending" ? s.status : "pending",
    }))
    .sort((a, b) => a.order - b.order);

  if (!sessions.length) {
    return buildLearningPathFromAnalysis(student, analysis, cneb);
  }

  // Asegurar orden pedagógico: diagnóstico → puentes → meta
  const hasMeta = sessions.some((s) => s.kind === "meta");
  if (!hasMeta) {
    sessions.push({
      id: "rs-meta",
      order: sessions.length + 1,
      title: goal,
      why: "Meta de la evidencia o del objetivo curricular.",
      kind: "meta",
      status: "pending",
    });
  } else {
    const meta = sessions.find((s) => s.kind === "meta");
    if (meta && !String(meta.title).trim()) meta.title = goal;
  }

  sessions = sessions.map((s, i) => ({ ...s, order: i + 1 }));
  if (!sessions.some((s) => s.status === "current")) {
    const firstPending = sessions.find((s) => s.status === "pending");
    if (firstPending) firstPending.status = "current";
    else if (sessions[0] && sessions[0].status !== "done") sessions[0].status = "current";
  }

  const estimate = Number(raw?.estimate) || sessions.length;
  return {
    goal,
    estimate: Math.max(sessions.length, estimate),
    generatedAt: raw?.generatedAt || new Date().toISOString(),
    sessions,
  };
}

function inferGaps(analysis, student) {
  if (Array.isArray(analysis?.gaps) && analysis.gaps.length) {
    return analysis.gaps.map((g) => String(g).trim()).filter(Boolean).slice(0, 3);
  }

  const blob = [
    analysis?.summary,
    analysis?.next,
    ...(analysis?.obs || []).map((o) => o?.t),
    student?.note,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const catalog = [
    { re: /sum(a|ar)|adici[oó]n/, label: "Sumar con precisión" },
    { re: /rest(a|ar)|sustracci[oó]n/, label: "Restar con precisión" },
    { re: /tablas?\s+de\s+multiplic|multiplic/, label: "Tablas de multiplicar" },
    { re: /fracci/, label: "Fracciones básicas" },
    { re: /decimal/, label: "Operaciones con decimales" },
    { re: /raz[oó]n|proporci/, label: "Razones y proporciones" },
    { re: /ecuaci/, label: "Plantear ecuaciones simples" },
    { re: /conectores?|coheren|p[aá]rrafo|estructur/, label: "Organizar ideas y conectores" },
    { re: /vocabular|palabra/, label: "Vocabulario clave del tema" },
    { re: /comprensi[oó]n|idea principal/, label: "Comprender la idea principal" },
    { re: /verbos?|tiempo(s)?\s+verbal/, label: "Tiempos verbales básicos" },
  ];

  const found = [];
  for (const item of catalog) {
    if (item.re.test(blob) && !found.includes(item.label)) found.push(item.label);
    if (found.length >= 2) break;
  }

  if (found.length) return found;

  // Puentes genéricos por área si no se detectan huecos explícitos
  const sid = student?.subjectId;
  if (sid === "mate") return ["Operaciones básicas del tema", "Aplicar el procedimiento paso a paso"];
  if (sid === "comunicacion" || sid === "castellano2") return ["Ordenar ideas (inicio–desarrollo–cierre)", "Usar conectores simples"];
  if (sid === "ingles") return ["Vocabulario del tema", "Frases cortas con estructura correcta"];
  if (sid === "cyt") return ["Observar y plantear la pregunta", "Registrar resultados con evidencia"];
  if (sid === "ccss") return ["Ubicar el hecho en contexto", "Usar fuentes o argumentos simples"];
  return ["Repasar la base del tema", "Practicar el procedimiento guiado"];
}

function buildLearningPathFromAnalysis(student, analysis, cneb) {
  const goal =
    analysis?.topicTitle ||
    student?.focus ||
    cneb?.capacity ||
    "Objetivo de aprendizaje";

  const gaps = inferGaps(analysis, student);
  const sessions = [
    {
      id: "rs-0",
      order: 1,
      title: "Diagnóstico: " + goal,
      why: analysis?.summary || analysis?.next || student?.note || "Punto de partida según la evidencia subida.",
      kind: "diagnostico",
      status: "done",
    },
  ];

  gaps.forEach((gap, i) => {
    sessions.push({
      id: "rs-p-" + (i + 1),
      order: sessions.length + 1,
      title: gap,
      why: `Base necesaria antes de abordar “${goal}”. Sin este paso, el alumno se atasca.`,
      kind: "puente",
      status: i === 0 ? "current" : "pending",
    });
  });

  sessions.push({
    id: "rs-meta",
    order: sessions.length + 1,
    title: goal,
    why: cneb
      ? `Meta alineada al CNEB: ${cneb.capacity}.`
      : "Meta de la evidencia: lo que se pedía en la tarea original.",
    kind: "meta",
    status: "pending",
  });

  return {
    goal,
    estimate: sessions.length,
    generatedAt: new Date().toISOString(),
    sessions,
  };
}

async function saveStudentLearningPath(studentId, teacherId, learningPath) {
  if (!studentId || !learningPath) return null;
  const list = (window.STUDENTS || []).map((s) =>
    s.id === studentId ? { ...s, learningPath } : s
  );
  syncStudentHelpers(list);
  if (window.saveLocalStudents) saveLocalStudents(teacherId, list);

  const client = window.supabaseClient;
  if (client && typeof isTeacherUuid === "function" && isTeacherUuid(teacherId)) {
    const { error } = await client
      .from("students")
      .update({ learning_path: learningPath })
      .eq("id", studentId)
      .eq("teacher_id", teacherId);
    if (error) console.warn("[ALIS] learning_path update:", error.message);
  }
  return list.find((s) => s.id === studentId);
}

function applyLearningPathFromAnalysis(studentId, teacherId, analysis) {
  const current = (window.STUDENTS || []).find((s) => s.id === studentId);
  if (!current) return null;
  const cneb = typeof cnebForStudent === "function" ? cnebForStudent(current) : null;
  const path = normalizeLearningPath(analysis?.learningPath, current, analysis, cneb);
  return saveStudentLearningPath(studentId, teacherId, path);
}

function learningPathForStudent(student) {
  if (!student) return null;
  if (student.learningPath?.sessions?.length) {
    return normalizeLearningPath(student.learningPath, student, null, cnebForStudent?.(student));
  }
  const cneb = typeof cnebForStudent === "function" ? cnebForStudent(student) : null;
  return buildLearningPathFromAnalysis(
    student,
    { topicTitle: student.focus, summary: student.note, next: student.note, obs: [] },
    cneb
  );
}

Object.assign(window, {
  normalizeLearningPath,
  buildLearningPathFromAnalysis,
  applyLearningPathFromAnalysis,
  saveStudentLearningPath,
  learningPathForStudent,
});
