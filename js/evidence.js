// evidence.js — subida + análisis IA (Gemini Flash-Lite vía Edge Function)

function isUuid(v) {
  return typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

function localEvidenceKey(teacherId) {
  return "alis_evidence_" + (teacherId || "anon");
}

function appendLocalEvidence(teacherId, item) {
  try {
    const key = localEvidenceKey(teacherId);
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.unshift(item);
    localStorage.setItem(key, JSON.stringify(list.slice(0, 50)));
  } catch (_) {}
}

function safeFileName(name) {
  return String(name || "evidencia")
    .replace(/[^\w.\-()+ ]+/g, "_")
    .slice(0, 120);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const b64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(b64);
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

async function callAnalyzeEvidence(payload) {
  const client = window.supabaseClient;
  if (!client) throw new Error("Supabase no disponible");

  const { data: sessionData } = await client.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("Inicia sesión de nuevo para analizar con IA.");

  const url = (window.ALIS_CONFIG?.supabaseUrl || "") + "/functions/v1/analyze-evidence";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      apikey: window.ALIS_CONFIG?.supabaseKey || "",
      "x-alis-client": "web-2026-08-01",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || ("Error IA " + res.status));
  const analysis = json.analysis && typeof json.analysis === "object" ? json.analysis : null;
  if (!analysis) throw new Error("Respuesta de análisis vacía o inválida.");
  const version = res.headers.get("x-alis-analyze-version")
    || json.alisAnalyzeVersion
    || analysis.alisAnalyzeVersion
    || null;
  analysis.alisAnalyzeVersion = version;
  // Solo avisa si no hay versión (función vieja sin redesplegar)
  analysis.alisAnalyzeStale = !version;
  return analysis;
}

/**
 * Sube evidencia y la analiza con Gemini Flash-Lite (Edge Function).
 */
async function uploadEvidence({ teacherId, student, file }) {
  if (!student?.id) throw new Error("Selecciona un alumno.");
  if (!file) throw new Error("Selecciona una foto o PDF.");
  if (!teacherId) throw new Error("Sesión de docente no válida.");

  const cneb = typeof cnebForStudent === "function" ? cnebForStudent(student) : null;
  const client = window.supabaseClient;
  const path = `${teacherId}/${student.id}/${Date.now()}-${safeFileName(file.name)}`;
  let evidenceRow = null;
  let filePath = null;

  if (client && isUuid(teacherId)) {
    const { error: upErr } = await client.storage.from("evidence").upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (!upErr) {
      filePath = path;
      const row = {
        teacher_id: teacherId,
        student_id: student.id,
        subject_id: student.subjectId,
        file_path: path,
        file_name: file.name,
        mime_type: file.type || null,
        status: "analyzing",
        analysis: null,
      };
      const { data, error } = await client.from("evidence").insert(row).select("*").single();
      if (!error && data) evidenceRow = data;
      else console.warn("[ALIS] evidence insert:", error?.message);
    } else {
      console.warn("[ALIS] storage upload:", upErr.message);
    }
  }

  let analysis;
  let analysisFailed = false;
  try {
    const payload = {
      evidenceId: evidenceRow?.id || null,
      filePath,
      mimeType: file.type || null,
      fileName: file.name,
      student: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        subject: student.subject,
        subjectId: student.subjectId,
        focus: student.focus,
      },
      cneb: cneb
        ? {
            id: cneb.id,
            competence: cneb.competence,
            capacity: cneb.capacity,
            performance: cneb.performance,
          }
        : null,
      expectedPractice: typeof expectedPracticeForStudent === "function"
        ? expectedPracticeForStudent(student)
        : null,
    };

    // Si no hay path en Storage, mandamos base64 (fotos pequeñas)
    if (!filePath) {
      if (file.size > 3_500_000) {
        throw new Error("Archivo grande y Storage no disponible. Ejecuta mvp-setup.sql o usa una foto más liviana.");
      }
      payload.fileBase64 = await fileToBase64(file);
    }

    analysis = await callAnalyzeEvidence(payload);
  } catch (err) {
    console.warn("[ALIS] analyze-evidence:", err.message);
    analysisFailed = true;
    // No inventar nota ni avanzar ruta: error honesto para el docente
    analysis = {
      aiFailed: true,
      score: null,
      status: "atencion",
      topicTitle: file.name || "Evidencia",
      graphicDescription: "",
      graphicElements: [],
      exerciseGoal: "",
      documentMarkdown: "",
      studentDiagnosis: {
        strengths: [],
        errors: ["No se pudo completar el análisis con IA."],
        summary: err.message || "Error al analizar la evidencia.",
      },
      obs: [{ ok: false, t: "IA no disponible: " + (err.message || "error desconocido") }],
      next: "Revisa el despliegue de analyze-evidence (Supabase) y vuelve a intentar.",
      summary: "Análisis no disponible. La ruta no se modificó.",
      alisAnalyzeStale: false,
    };
  }

  if (evidenceRow?.id && client) {
    await client.from("evidence").update({
      status: analysisFailed ? "error" : "analyzed",
      analysis,
    }).eq("id", evidenceRow.id);
  }

  const score = analysis?.score;
  const topic = analysis?.topicTitle || file.name;

  let pathOutcome = null;
  // Solo tocar la ruta si el análisis real de la IA se completó
  if (!analysisFailed && typeof applyLearningPathFromAnalysis === "function") {
    const pathResult = await applyLearningPathFromAnalysis(student.id, teacherId, analysis);
    pathOutcome = pathResult?.outcome || null;
  } else if (analysisFailed) {
    pathOutcome = {
      passed: false,
      advanced: false,
      applied: false,
      aiFailed: true,
      message: "No se pudo analizar con IA. La ruta no se modificó.",
    };
  }

  const historyId = "h-" + Date.now();
  await appendStudentHistory(student.id, teacherId, {
    id: historyId,
    label: topic,
    date: "Hoy",
    score: score == null ? null : Number(score),
    type: analysisFailed ? "Error IA" : "Evidencia",
    status: analysis?.status || null,
    fileName: file.name,
    graphicDescription: analysis?.graphicDescription || "",
    graphicElements: analysis?.graphicElements || [],
    exerciseGoal: analysis?.exerciseGoal || "",
    documentMarkdown: analysis?.documentMarkdown || "",
    studentDiagnosis: analysis?.studentDiagnosis || null,
    summary: analysis?.summary || "",
    obs: analysis?.obs || [],
    next: analysis?.next || "",
    pathSessionTitle: pathOutcome?.sessionTitle || null,
    pathResult: analysisFailed
      ? "error_ia"
      : (pathOutcome?.mismatched
        ? "no_aplica"
        : (pathOutcome?.passed ? "aprobada" : (pathOutcome ? "retoma" : null))),
    pathMessage: pathOutcome?.message || null,
    pathMatch: pathOutcome?.match || analysis?.pathMatch || null,
  });

  // No ensuciar métricas del alumno con análisis inventados
  if (!analysisFailed) {
    if (typeof applyAnalysisToStudent === "function") {
      applyAnalysisToStudent(student.id, teacherId, analysis);
    }
    if (typeof createSuggestionFromAnalysis === "function") {
      await createSuggestionFromAnalysis(teacherId, student, analysis);
    }
    if (typeof createPendingFromEvidence === "function") {
      await createPendingFromEvidence(teacherId, student, analysis, file.name);
    }
  }

  if (!evidenceRow) {
    const localItem = {
      id: "ev-" + Date.now(),
      teacherId,
      studentId: student.id,
      subjectId: student.subjectId,
      fileName: file.name,
      mimeType: file.type,
      status: analysisFailed ? "error" : "analyzed",
      analysis,
      createdAt: new Date().toISOString(),
    };
    appendLocalEvidence(teacherId, localItem);
    return { evidence: localItem, analysis, pathOutcome, source: "local", analysisFailed, historyId };
  }

  return {
    evidence: { ...evidenceRow, analysis, status: analysisFailed ? "error" : "analyzed" },
    analysis,
    pathOutcome,
    source: "supabase",
    analysisFailed,
    historyId,
  };
}

/** Actualiza solo campos de ruta en un ítem del historial (p. ej. tras validar código manual). */
async function patchHistoryPathFields(studentId, teacherId, entryKey, fields) {
  const current = (window.STUDENTS || []).find((s) => s.id === studentId);
  if (!current) return null;
  const history = [...(current.history || [])];
  const idx = entryKey
    ? findHistoryIndex(history, entryKey)
    : (history.length ? 0 : -1);
  if (idx < 0) return null;

  history[idx] = {
    ...history[idx],
    pathSessionTitle: fields.pathSessionTitle != null
      ? fields.pathSessionTitle
      : history[idx].pathSessionTitle,
    pathResult: fields.pathResult != null ? fields.pathResult : history[idx].pathResult,
    pathMessage: fields.pathMessage != null ? fields.pathMessage : history[idx].pathMessage,
    pathMatch: fields.pathMatch != null ? fields.pathMatch : history[idx].pathMatch,
  };
  return persistStudentHistory(studentId, teacherId, history, current.sessions || history.length);
}

async function appendStudentHistory(studentId, teacherId, entry) {
  const current = (window.STUDENTS || []).find((s) => s.id === studentId);
  if (!current) return;
  const history = [entry, ...(current.history || [])].slice(0, 20);
  const nextSessions = (current.sessions || 0) + 1;
  const list = (window.STUDENTS || []).map((s) =>
    s.id === studentId ? { ...s, history, sessions: nextSessions, lastSession: "Hoy" } : s
  );
  syncStudentHelpers(list);
  if (window.saveLocalStudents) saveLocalStudents(teacherId, list);

  const client = window.supabaseClient;
  if (client && isUuid(teacherId)) {
    await client
      .from("students")
      .update({ history, sessions: nextSessions, last_session: "Hoy" })
      .eq("id", studentId)
      .eq("teacher_id", teacherId);
  }
}

function historyEntryKey(entry, index) {
  return entry?.id || ("idx-" + index);
}

function findHistoryIndex(history, entryKey) {
  const list = history || [];
  const byId = list.findIndex((h) => h && h.id && h.id === entryKey);
  if (byId >= 0) return byId;
  if (String(entryKey).startsWith("idx-")) {
    const idx = Number(String(entryKey).slice(4));
    return Number.isInteger(idx) && idx >= 0 && idx < list.length ? idx : -1;
  }
  const asNum = Number(entryKey);
  return Number.isInteger(asNum) && asNum >= 0 && asNum < list.length ? asNum : -1;
}

async function persistStudentHistory(studentId, teacherId, history, sessions) {
  const patch = { history, sessions, lastSession: sessions > 0 ? "Hoy" : "—" };
  const list = (window.STUDENTS || []).map((s) =>
    s.id === studentId ? { ...s, ...patch } : s
  );
  syncStudentHelpers(list);
  if (window.saveLocalStudents) saveLocalStudents(teacherId, list);

  const client = window.supabaseClient;
  if (client && isUuid(teacherId)) {
    const { error } = await client
      .from("students")
      .update({ history, sessions, last_session: patch.lastSession })
      .eq("id", studentId)
      .eq("teacher_id", teacherId);
    if (error) throw new Error(error.message || "No se pudo guardar el historial.");
  }
  return list.find((s) => s.id === studentId);
}

async function updateStudentHistoryEntry(studentId, teacherId, entryKey, patch) {
  const current = (window.STUDENTS || []).find((s) => s.id === studentId);
  if (!current) throw new Error("Alumno no encontrado.");
  const history = [...(current.history || [])];
  const idx = findHistoryIndex(history, entryKey);
  if (idx < 0) throw new Error("Resultado no encontrado.");

  const label = String(patch.label || "").trim();
  if (!label) throw new Error("El título es obligatorio.");

  let score = patch.score;
  if (score === "" || score == null) score = null;
  else {
    score = Number(score);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      throw new Error("La nota debe ser un número entre 0 y 100.");
    }
    score = Math.round(score);
  }

  const prev = history[idx] || {};
  const nextDiagnosis = patch.studentDiagnosis && typeof patch.studentDiagnosis === "object"
    ? {
        strengths: Array.isArray(patch.studentDiagnosis.strengths)
          ? patch.studentDiagnosis.strengths
          : (prev.studentDiagnosis?.strengths || []),
        errors: Array.isArray(patch.studentDiagnosis.errors)
          ? patch.studentDiagnosis.errors
          : (prev.studentDiagnosis?.errors || []),
        summary: String(
          patch.studentDiagnosis.summary != null
            ? patch.studentDiagnosis.summary
            : (prev.studentDiagnosis?.summary || "")
        ).trim(),
      }
    : (prev.studentDiagnosis || null);

  history[idx] = {
    ...prev,
    id: prev.id || ("h-" + Date.now() + "-" + idx),
    label,
    score,
    graphicDescription: patch.graphicDescription != null
      ? String(patch.graphicDescription).trim()
      : (prev.graphicDescription || ""),
    exerciseGoal: patch.exerciseGoal != null
      ? String(patch.exerciseGoal).trim()
      : (prev.exerciseGoal || ""),
    summary: patch.summary != null
      ? String(patch.summary).trim()
      : (prev.summary || ""),
    next: patch.next != null
      ? String(patch.next).trim()
      : (prev.next || ""),
    studentDiagnosis: nextDiagnosis,
  };

  return persistStudentHistory(studentId, teacherId, history, current.sessions || history.length);
}

async function deleteStudentHistoryEntry(studentId, teacherId, entryKey) {
  const current = (window.STUDENTS || []).find((s) => s.id === studentId);
  if (!current) throw new Error("Alumno no encontrado.");
  const history = [...(current.history || [])];
  const idx = findHistoryIndex(history, entryKey);
  if (idx < 0) throw new Error("Resultado no encontrado.");

  history.splice(idx, 1);
  const sessions = Math.max(0, (current.sessions || 0) - 1);
  return persistStudentHistory(studentId, teacherId, history, sessions);
}

Object.assign(window, {
  uploadEvidence,
  isUuid,
  callAnalyzeEvidence,
  historyEntryKey,
  updateStudentHistoryEntry,
  deleteStudentHistoryEntry,
  patchHistoryPathFields,
});
