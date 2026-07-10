// suggestions.js — sugerencias y pendientes desde análisis de evidencia

function localSuggestionsKey(teacherId) {
  return "alis_suggestions_" + (teacherId || "anon");
}

function localPendingKey(teacherId) {
  return "alis_pending_" + (teacherId || "anon");
}

function loadLocalSuggestions(teacherId) {
  try {
    return JSON.parse(localStorage.getItem(localSuggestionsKey(teacherId)) || "[]");
  } catch {
    return [];
  }
}

function saveLocalSuggestions(teacherId, list) {
  localStorage.setItem(localSuggestionsKey(teacherId), JSON.stringify((list || []).slice(0, 40)));
}

function loadLocalPending(teacherId) {
  try {
    return JSON.parse(localStorage.getItem(localPendingKey(teacherId)) || "[]");
  } catch {
    return [];
  }
}

function saveLocalPending(teacherId, list) {
  localStorage.setItem(localPendingKey(teacherId), JSON.stringify((list || []).slice(0, 40)));
}

function buildSuggestionFromAnalysis(student, analysis) {
  const first = (student.name || "Alumno").split(" ")[0];
  const topic = analysis?.topicTitle || student.focus || "el tema actual";
  const status = analysis?.status || "atencion";
  const tag =
    status === "destacado" ? "Avance" :
    status === "normal" ? "Seguimiento" :
    status === "riesgo" ? "Refuerzo" : "Refuerzo";

  const errors = (analysis?.obs || []).filter((o) => o && o.ok === false).map((o) => o.t).slice(0, 2);
  const body =
    analysis?.next ||
    (errors.length ? errors.join(" ") : `Revisar el desempeño reciente en ${topic}.`);

  return {
    id: "sg-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    studentId: student.id,
    title: `${first} necesita apoyo en ${topic}`,
    body: String(body).slice(0, 320),
    tag,
    cta: "Generar práctica",
  };
}

function buildPendingFromEvidence(student, analysis, fileName) {
  const isPdf = /\.pdf$/i.test(fileName || "");
  return {
    id: "pd-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    studentId: student.id,
    label: analysis?.topicTitle || fileName || "Evidencia",
    kind: "Analizado por Alis",
    time: "Ahora",
    icon: isPdf ? "file" : "image",
  };
}

function applyAnalysisToStudent(studentId, teacherId, analysis) {
  const current = (window.STUDENTS || []).find((s) => s.id === studentId);
  if (!current || !analysis) return current;

  const score = analysis.score == null ? null : Number(analysis.score);
  const nextProgress =
    score != null && !Number.isNaN(score)
      ? Math.round((Number(current.progress || 0) * 0.4) + (score * 0.6))
      : current.progress;

  const patch = {
    status: analysis.status || current.status,
    progress: Math.max(0, Math.min(100, nextProgress ?? current.progress ?? 0)),
    focus: analysis.topicTitle || current.focus,
    note: analysis.summary || analysis.next || current.note,
    trend: score == null ? current.trend : (score >= 70 ? 4 : score >= 50 ? 0 : -4),
  };

  const list = (window.STUDENTS || []).map((s) => (s.id === studentId ? { ...s, ...patch } : s));
  syncStudentHelpers(list);
  if (window.saveLocalStudents) saveLocalStudents(teacherId, list);

  const client = window.supabaseClient;
  if (client && typeof isTeacherUuid === "function" && isTeacherUuid(teacherId)) {
    client
      .from("students")
      .update({
        status: patch.status,
        progress: patch.progress,
        focus: patch.focus,
        note: patch.note,
        trend: patch.trend,
      })
      .eq("id", studentId)
      .eq("teacher_id", teacherId)
      .then(({ error }) => {
        if (error) console.warn("[ALIS] update student from analysis:", error.message);
      });
  }

  return list.find((s) => s.id === studentId);
}

async function createSuggestionFromAnalysis(teacherId, student, analysis) {
  if (!student?.id || !analysis) return null;
  const suggestion = buildSuggestionFromAnalysis(student, analysis);

  const local = [suggestion, ...loadLocalSuggestions(teacherId).filter((s) => s.studentId !== student.id || s.tag !== suggestion.tag)];
  saveLocalSuggestions(teacherId, local);
  window.SUGGESTIONS = [suggestion, ...(window.SUGGESTIONS || []).filter((s) => s.id !== suggestion.id && !(s.studentId === student.id && s.title === suggestion.title))];

  const client = window.supabaseClient;
  if (client && typeof isTeacherUuid === "function" && isTeacherUuid(teacherId)) {
    const row = {
      id: suggestion.id,
      student_id: suggestion.studentId,
      title: suggestion.title,
      body: suggestion.body,
      tag: suggestion.tag,
      cta: suggestion.cta,
      teacher_id: teacherId,
    };
    const { error } = await client.from("suggestions").insert(row);
    if (error) console.warn("[ALIS] suggestion insert:", error.message);
  }

  return suggestion;
}

async function createPendingFromEvidence(teacherId, student, analysis, fileName) {
  if (!student?.id) return null;
  const item = buildPendingFromEvidence(student, analysis, fileName);
  const local = [item, ...loadLocalPending(teacherId)];
  saveLocalPending(teacherId, local);
  window.PENDING = [item, ...(window.PENDING || []).filter((p) => p.id !== item.id)];

  const client = window.supabaseClient;
  if (client && typeof isTeacherUuid === "function" && isTeacherUuid(teacherId)) {
    const row = {
      id: item.id,
      student_id: item.studentId,
      label: item.label,
      kind: item.kind,
      time: item.time,
      icon: item.icon,
      teacher_id: teacherId,
    };
    const { error } = await client.from("pending").insert(row);
    if (error) console.warn("[ALIS] pending insert:", error.message);
  }

  return item;
}

function dismissSuggestion(teacherId, suggestionId) {
  const local = loadLocalSuggestions(teacherId).filter((s) => s.id !== suggestionId);
  saveLocalSuggestions(teacherId, local);
  window.SUGGESTIONS = (window.SUGGESTIONS || []).filter((s) => s.id !== suggestionId);

  const client = window.supabaseClient;
  if (client && typeof isTeacherUuid === "function" && isTeacherUuid(teacherId)) {
    client.from("suggestions").delete().eq("id", suggestionId).then(({ error }) => {
      if (error) console.warn("[ALIS] suggestion delete:", error.message);
    });
  }
}

function mergeTeacherFeed(teacherId, remoteSuggestions, remotePending, studentIds) {
  const ids = studentIds instanceof Set ? studentIds : new Set(studentIds || []);
  const localS = loadLocalSuggestions(teacherId).filter((s) => ids.has(s.studentId));
  const localP = loadLocalPending(teacherId).filter((p) => ids.has(p.studentId));
  const remoteS = (remoteSuggestions || []).filter((s) => ids.has(s.studentId));
  const remoteP = (remotePending || []).filter((p) => ids.has(p.studentId));

  const sugMap = new Map();
  [...remoteS, ...localS].forEach((s) => sugMap.set(s.id, s));
  const pendMap = new Map();
  [...remoteP, ...localP].forEach((p) => pendMap.set(p.id, p));

  window.SUGGESTIONS = Array.from(sugMap.values()).slice(0, 30);
  window.PENDING = Array.from(pendMap.values()).slice(0, 30);
}

Object.assign(window, {
  buildSuggestionFromAnalysis,
  createSuggestionFromAnalysis,
  createPendingFromEvidence,
  applyAnalysisToStudent,
  dismissSuggestion,
  mergeTeacherFeed,
  loadLocalSuggestions,
  loadLocalPending,
});
