// ruta.js — línea de tiempo de sesiones (fácil → objetivo) + avance por evidencia

const LEARNING_PATH_PASS_SCORE = 70;

function normalizeExpectedPractice(raw) {
  if (!raw || typeof raw !== "object") return null;
  const prompts = Array.isArray(raw.samplePrompts)
    ? raw.samplePrompts.map((p) => String(p || "").trim()).filter(Boolean).slice(0, 6)
    : [];
  const title = String(raw.title || "").trim();
  const topic = String(raw.topic || title || "").trim();
  const code = String(raw.code || "").trim().toUpperCase();
  if (!title && !topic && !prompts.length && !code) return null;
  return {
    id: raw.id || null,
    sessionId: raw.sessionId || null,
    title: title || topic,
    topic: topic || title,
    why: String(raw.why || "").trim(),
    type: String(raw.type || "").trim() || null,
    code: code || null,
    samplePrompts: prompts,
    generatedAt: raw.generatedAt || null,
    source: raw.source === "generated" ? "generated" : "session",
  };
}

function collectUsedPracticeCodes() {
  const used = new Set();
  const students = window.STUDENTS || [];
  for (const student of students) {
    const sessions = student?.learningPath?.sessions || [];
    for (const session of sessions) {
      const code = String(session?.expectedPractice?.code || "").trim().toUpperCase();
      if (code) used.add(code);
    }
  }

  try {
    const stored = JSON.parse(localStorage.getItem("alis_practice_codes") || "[]");
    if (Array.isArray(stored)) {
      stored.forEach((c) => {
        const code = String(c || "").trim().toUpperCase();
        if (code) used.add(code);
      });
    }
  } catch {
    /* ignore */
  }

  return used;
}

function rememberPracticeCode(code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return;
  try {
    const stored = JSON.parse(localStorage.getItem("alis_practice_codes") || "[]");
    const list = Array.isArray(stored) ? stored.map((c) => String(c || "").toUpperCase()) : [];
    if (!list.includes(normalized)) {
      list.push(normalized);
      localStorage.setItem("alis_practice_codes", JSON.stringify(list.slice(-2000)));
    }
  } catch {
    /* ignore */
  }
}

function makePracticeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const used = collectUsedPracticeCodes();
  for (let attempt = 0; attempt < 40; attempt += 1) {
    let body = "";
    for (let i = 0; i < 6; i += 1) {
      body += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    const code = "ALIS-" + body;
    if (!used.has(code)) {
      rememberPracticeCode(code);
      return code;
    }
  }
  // Fallback ultra-raro: timestamp para no bloquear generación
  const fallback = "ALIS-" + Date.now().toString(36).toUpperCase().slice(-6);
  rememberPracticeCode(fallback);
  return fallback;
}

function evidenceMentionsPracticeCode(analysis, code) {
  const raw = String(code || "").toUpperCase().replace(/\s+/g, "");
  if (!raw) return false;
  const compact = raw.replace(/-/g, "");
  const blob = [
    analysis?.documentMarkdown,
    analysis?.graphicDescription,
    analysis?.exerciseGoal,
    analysis?.summary,
    analysis?.topicTitle,
    analysis?.pathMatchReason,
    analysis?.practiceCodeSeen,
    ...(analysis?.obs || []).map((o) => o?.t),
  ]
    .filter(Boolean)
    .join("\n")
    .toUpperCase()
    .replace(/\s+/g, "");

  if (analysis?.practiceCodeFound === true) return true;
  if (blob.includes(raw) || blob.includes(compact)) return true;
  const seen = String(analysis?.practiceCodeSeen || "").toUpperCase().replace(/\s+/g, "");
  return !!(seen && (seen === raw || seen === compact || seen.includes(compact)));
}

function resolvePathMatch(analysis, expected) {
  // Solo avanza/retoma con práctica GENERADA por ALIS y código visible en la evidencia.
  if (!expected || expected.source !== "generated" || !expected.code) {
    return {
      match: "no",
      reason: "Primero genera la práctica de ALIS de esta sesión. Sin ese PDF, la ruta no avanza.",
    };
  }

  if (!evidenceMentionsPracticeCode(analysis, expected.code)) {
    return {
      match: "no",
      reason: `No se detectó el código ${expected.code}. Sube la hoja generada por ALIS con el código visible.`,
    };
  }

  const ai = String(analysis?.pathMatch || "").toLowerCase().trim();
  if (ai === "no") {
    return {
      match: "no",
      reason: String(analysis?.pathMatchReason || "").trim()
        || "El código aparece, pero el contenido no corresponde a esa práctica.",
    };
  }

  return {
    match: "yes",
    reason: `Práctica ALIS verificada (${expected.code}).`,
  };
}

function expectedPracticeForStudent(student) {
  if (!student?.learningPath?.sessions?.length) return null;
  const cneb = typeof cnebForStudent === "function" ? cnebForStudent(student) : null;
  const path = normalizeLearningPath(student.learningPath, student, null, cneb);
  const current = (path?.sessions || []).find((s) => s.status === "current");
  if (!current?.expectedPractice || current.expectedPractice.source !== "generated") return null;
  return {
    ...current.expectedPractice,
    sessionId: current.expectedPractice.sessionId || current.id,
    sessionTitle: current.title,
  };
}

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
      attempts: Number(s.attempts) || 0,
      lastScore: s.lastScore == null || s.lastScore === "" ? null : Number(s.lastScore),
      lastResult: s.lastResult === "aprobada" || s.lastResult === "retoma" ? s.lastResult : null,
      lastEvidenceAt: s.lastEvidenceAt || null,
      expectedPractice: normalizeExpectedPractice(s.expectedPractice),
    }))
    .sort((a, b) => a.order - b.order);

  if (!sessions.length) {
    return buildLearningPathFromAnalysis(student, analysis, cneb);
  }

  const hasMeta = sessions.some((s) => s.kind === "meta");
  if (!hasMeta) {
    sessions.push({
      id: "rs-meta",
      order: sessions.length + 1,
      title: goal,
      why: "Meta de la evidencia o del objetivo curricular.",
      kind: "meta",
      status: "pending",
      attempts: 0,
      lastScore: null,
      lastResult: null,
      lastEvidenceAt: null,
      expectedPractice: null,
    });
  } else {
    const meta = sessions.find((s) => s.kind === "meta");
    if (meta && !String(meta.title).trim()) meta.title = goal;
  }

  sessions = sessions.map((s, i) => ({ ...s, order: i + 1 }));
  if (!sessions.some((s) => s.status === "current") && !sessions.every((s) => s.status === "done")) {
    const firstPending = sessions.find((s) => s.status === "pending");
    if (firstPending) firstPending.status = "current";
    else if (sessions[0] && sessions[0].status !== "done") sessions[0].status = "current";
  }

  const estimate = Number(raw?.estimate) || sessions.length;
  return {
    goal,
    estimate: Math.max(sessions.length, estimate),
    passScore: Number(raw?.passScore) || LEARNING_PATH_PASS_SCORE,
    generatedAt: raw?.generatedAt || new Date().toISOString(),
    updatedAt: raw?.updatedAt || null,
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
    analysis?.exerciseGoal,
    analysis?.studentDiagnosis?.summary,
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
      why: analysis?.summary || analysis?.studentDiagnosis?.summary || analysis?.next || student?.note || "Punto de partida según la evidencia subida.",
      kind: "diagnostico",
      status: "done",
      attempts: 1,
      lastScore: analysis?.score == null ? null : Number(analysis.score),
      lastResult: "aprobada",
      lastEvidenceAt: new Date().toISOString(),
      expectedPractice: null,
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
      attempts: 0,
      lastScore: null,
      lastResult: null,
      lastEvidenceAt: null,
      expectedPractice: null,
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
    status: gaps.length ? "pending" : "current",
    attempts: 0,
    lastScore: null,
    lastResult: null,
    lastEvidenceAt: null,
    expectedPractice: null,
  });

  return {
    goal,
    estimate: sessions.length,
    passScore: LEARNING_PATH_PASS_SCORE,
    generatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sessions,
  };
}

function didPassLearningSession(analysis, passScore) {
  const threshold = Number(passScore) || LEARNING_PATH_PASS_SCORE;
  if (analysis?.score != null && analysis.score !== "" && Number.isFinite(Number(analysis.score))) {
    return Number(analysis.score) >= threshold;
  }
  return analysis?.status === "normal" || analysis?.status === "destacado";
}

function progressExistingLearningPath(path, analysis) {
  const passScore = Number(path?.passScore) || LEARNING_PATH_PASS_SCORE;
  const sessions = (path.sessions || []).map((s) => ({ ...s }));
  let currentIdx = sessions.findIndex((s) => s.status === "current");

  if (currentIdx < 0) {
    currentIdx = sessions.findIndex((s) => s.status === "pending");
    if (currentIdx >= 0) sessions[currentIdx].status = "current";
  }

  if (currentIdx < 0) {
    return {
      path: {
        ...path,
        sessions,
        updatedAt: new Date().toISOString(),
      },
      outcome: {
        passed: true,
        advanced: false,
        completed: true,
        sessionTitle: null,
        score: analysis?.score == null ? null : Number(analysis.score),
        passScore,
        message: "La ruta ya estaba completa.",
      },
    };
  }

  const passed = didPassLearningSession(analysis, passScore);
  const score = analysis?.score == null || analysis?.score === "" ? null : Number(analysis.score);
  const session = { ...sessions[currentIdx] };
  session.attempts = (Number(session.attempts) || 0) + 1;
  session.lastScore = Number.isFinite(score) ? score : session.lastScore;
  session.lastResult = passed ? "aprobada" : "retoma";
  session.lastEvidenceAt = new Date().toISOString();

  let advanced = false;
  if (passed) {
    session.status = "done";
    session.expectedPractice = null;
    sessions[currentIdx] = session;
    const nextIdx = sessions.findIndex((s, i) => i > currentIdx && s.status === "pending");
    if (nextIdx >= 0) {
      sessions[nextIdx] = { ...sessions[nextIdx], status: "current" };
      advanced = true;
    }
  } else {
    session.status = "current";
    sessions[currentIdx] = session;
  }

  const completed = sessions.every((s) => s.status === "done");
  const nextCurrent = sessions.find((s) => s.status === "current");

  return {
    path: {
      ...path,
      sessions,
      passScore,
      updatedAt: new Date().toISOString(),
    },
    outcome: {
      passed,
      advanced,
      completed,
      sessionId: session.id,
      sessionTitle: session.title,
      score: Number.isFinite(score) ? score : null,
      passScore,
      attempts: session.attempts,
      nextTitle: nextCurrent?.title || null,
      message: passed
        ? (advanced
          ? `Aprobó “${session.title}” (${score ?? "sin nota"}). Avanza a “${nextCurrent.title}”.`
          : `Aprobó “${session.title}”. Completó la ruta.`)
        : `Retoma “${session.title}”. Nota ${score ?? "sin estimar"} / mínimo ${passScore}. Genera otra práctica del mismo nivel.`,
    },
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

async function recordExpectedPractice(studentId, teacherId, material, opts = {}) {
  const current = (window.STUDENTS || []).find((s) => s.id === studentId);
  if (!current || !material) return null;

  const cneb = typeof cnebForStudent === "function" ? cnebForStudent(current) : null;
  const base = current.learningPath?.sessions?.length
    ? current.learningPath
    : (typeof learningPathForStudent === "function" ? learningPathForStudent(current) : null);
  if (!base?.sessions?.length) return null;

  const path = normalizeLearningPath(base, current, null, cneb);
  let idx = -1;
  if (opts.sessionId) idx = path.sessions.findIndex((s) => s.id === opts.sessionId);
  if (idx < 0) idx = path.sessions.findIndex((s) => s.status === "current");
  if (idx < 0) return null;

  const session = { ...path.sessions[idx] };
  const prompts = Array.isArray(material.exercises)
    ? material.exercises.map((ex) => String(ex?.prompt || "").trim()).filter(Boolean).slice(0, 6)
    : [];

  session.expectedPractice = normalizeExpectedPractice({
    id: "ep-" + Date.now(),
    sessionId: session.id,
    title: material.title || session.title,
    topic: material.topic || session.title,
    why: session.why || "",
    type: material.type || opts.type || null,
    code: (() => {
      const incoming = String(material.practiceCode || opts.code || "").trim().toUpperCase();
      if (incoming) {
        rememberPracticeCode(incoming);
        return incoming;
      }
      return makePracticeCode();
    })(),
    samplePrompts: prompts,
    generatedAt: new Date().toISOString(),
    source: "generated",
  });
  // Devolver el código efectivo al material/UI
  if (material && session.expectedPractice?.code) {
    material.practiceCode = session.expectedPractice.code;
  }
  path.sessions[idx] = session;
  path.updatedAt = new Date().toISOString();

  return saveStudentLearningPath(studentId, teacherId, path);
}

async function applyLearningPathFromAnalysis(studentId, teacherId, analysis) {
  const current = (window.STUDENTS || []).find((s) => s.id === studentId);
  if (!current) return { student: null, outcome: null };

  const cneb = typeof cnebForStudent === "function" ? cnebForStudent(current) : null;
  const existing = current.learningPath?.sessions?.length
    ? normalizeLearningPath(current.learningPath, current, null, cneb)
    : null;

  const hasOpenSession = existing?.sessions?.some((s) => s.status === "current" || s.status === "pending");

  let path;
  let outcome;

  if (existing && hasOpenSession) {
    const currentSession = existing.sessions.find((s) => s.status === "current")
      || existing.sessions.find((s) => s.status === "pending");
    const expected = currentSession?.expectedPractice || null;
    const match = resolvePathMatch(analysis, expected);

    if (match.match !== "yes") {
      return {
        student: current,
        outcome: {
          passed: false,
          advanced: false,
          completed: false,
          applied: false,
          mismatched: true,
          match: match.match,
          matchReason: match.reason,
          sessionId: currentSession?.id || null,
          sessionTitle: currentSession?.title || null,
          score: analysis?.score == null ? null : Number(analysis.score),
          passScore: existing.passScore || LEARNING_PATH_PASS_SCORE,
          attempts: currentSession?.attempts || 0,
          nextTitle: currentSession?.title || null,
          message: match.reason
            || `Evidencia no válida para “${currentSession?.title || "la sesión actual"}”. La ruta no cambió.`,
        },
        path: existing,
      };
    }

    const progressed = progressExistingLearningPath(existing, analysis);
    path = progressed.path;
    outcome = {
      ...progressed.outcome,
      applied: true,
      mismatched: false,
      match: match.match,
      matchReason: match.reason,
    };
  } else {
    path = normalizeLearningPath(analysis?.learningPath, current, analysis, cneb);
    const currentSession = path.sessions.find((s) => s.status === "current");
    outcome = {
      passed: true,
      advanced: false,
      completed: false,
      applied: true,
      mismatched: false,
      sessionId: path.sessions[0]?.id || null,
      sessionTitle: path.sessions[0]?.title || "Diagnóstico",
      score: analysis?.score == null ? null : Number(analysis.score),
      passScore: path.passScore || LEARNING_PATH_PASS_SCORE,
      attempts: 1,
      nextTitle: currentSession?.title || null,
      message: currentSession
        ? `Ruta creada. Siguiente sesión en curso: “${currentSession.title}” (mínimo ${path.passScore || LEARNING_PATH_PASS_SCORE}).`
        : "Ruta creada.",
      created: true,
    };
  }

  const student = await saveStudentLearningPath(studentId, teacherId, path);
  return { student, outcome, path };
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
  LEARNING_PATH_PASS_SCORE,
  normalizeLearningPath,
  buildLearningPathFromAnalysis,
  applyLearningPathFromAnalysis,
  progressExistingLearningPath,
  saveStudentLearningPath,
  learningPathForStudent,
  expectedPracticeForStudent,
  recordExpectedPractice,
  resolvePathMatch,
  makePracticeCode,
});
