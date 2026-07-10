// evidence.js — subida + análisis IA (Claude vía Edge Function)

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
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || ("Error IA " + res.status));
  return json.analysis;
}

/**
 * Sube evidencia y la analiza con Claude (Edge Function).
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
    // Fallback curricular si la función aún no está desplegada
    analysis = typeof buildEvidenceAnalysis === "function"
      ? buildEvidenceAnalysis(student, file.name)
      : { score: null, status: "atencion", topicTitle: file.name, obs: [{ ok: false, t: err.message }], next: "Reintentar análisis." };
    analysis.obs = [
      ...(analysis.obs || []),
      { ok: false, t: "IA no disponible ahora: " + err.message },
    ];
  }

  if (evidenceRow?.id && client) {
    await client.from("evidence").update({ status: "analyzed", analysis }).eq("id", evidenceRow.id);
  }

  const score = analysis?.score;
  const topic = analysis?.topicTitle || file.name;
  await appendStudentHistory(student.id, teacherId, {
    label: topic,
    date: "Hoy",
    score: score == null ? null : Number(score),
    type: "Evidencia",
    status: analysis?.status || null,
    fileName: file.name,
  });

  if (typeof applyAnalysisToStudent === "function") {
    applyAnalysisToStudent(student.id, teacherId, analysis);
  }
  if (typeof createSuggestionFromAnalysis === "function") {
    await createSuggestionFromAnalysis(teacherId, student, analysis);
  }
  if (typeof createPendingFromEvidence === "function") {
    await createPendingFromEvidence(teacherId, student, analysis, file.name);
  }

  if (!evidenceRow) {
    const localItem = {
      id: "ev-" + Date.now(),
      teacherId,
      studentId: student.id,
      subjectId: student.subjectId,
      fileName: file.name,
      mimeType: file.type,
      status: "analyzed",
      analysis,
      createdAt: new Date().toISOString(),
    };
    appendLocalEvidence(teacherId, localItem);
    return { evidence: localItem, analysis, source: "local" };
  }

  return { evidence: { ...evidenceRow, analysis, status: "analyzed" }, analysis, source: "supabase" };
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

Object.assign(window, { uploadEvidence, isUuid, callAnalyzeEvidence });
