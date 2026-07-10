// evidence.js — subida real de evidencia (Storage + tabla)

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

/**
 * Sube evidencia del alumno.
 * @returns {{ evidence, analysis }}
 */
async function uploadEvidence({ teacherId, student, file }) {
  if (!student?.id) throw new Error("Selecciona un alumno.");
  if (!file) throw new Error("Selecciona una foto o PDF.");
  if (!teacherId) throw new Error("Sesión de docente no válida.");

  const analysis = buildEvidenceAnalysis(student, file.name);
  const client = window.supabaseClient;
  const path = `${teacherId}/${student.id}/${Date.now()}-${safeFileName(file.name)}`;

  if (client && isUuid(teacherId)) {
    const { error: upErr } = await client.storage.from("evidence").upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (!upErr) {
      const row = {
        teacher_id: teacherId,
        student_id: student.id,
        subject_id: student.subjectId,
        file_path: path,
        file_name: file.name,
        mime_type: file.type || null,
        status: "reviewed",
        analysis,
      };
      const { data, error } = await client.from("evidence").insert(row).select("*").single();
      if (!error && data) {
        await appendStudentHistory(student.id, teacherId, {
          label: file.name,
          date: "Hoy",
          score: null,
          type: "Evidencia",
        });
        return { evidence: data, analysis, source: "supabase" };
      }
      console.warn("[ALIS] evidence insert:", error?.message);
    } else {
      console.warn("[ALIS] storage upload:", upErr.message);
    }
  }

  // Respaldo local (sin Storage / sin UUID de auth)
  const localItem = {
    id: "ev-" + Date.now(),
    teacherId,
    studentId: student.id,
    subjectId: student.subjectId,
    fileName: file.name,
    mimeType: file.type,
    status: "reviewed",
    analysis,
    createdAt: new Date().toISOString(),
  };
  appendLocalEvidence(teacherId, localItem);
  await appendStudentHistory(student.id, teacherId, {
    label: file.name,
    date: "Hoy",
    score: null,
    type: "Evidencia",
  });
  return { evidence: localItem, analysis, source: "local" };
}

async function appendStudentHistory(studentId, teacherId, entry) {
  const current = (window.STUDENTS || []).find((s) => s.id === studentId);
  if (!current) return;
  const history = [entry, ...(current.history || [])].slice(0, 20);
  const list = (window.STUDENTS || []).map((s) =>
    s.id === studentId ? { ...s, history, sessions: (s.sessions || 0) + 1, lastSession: "Hoy" } : s
  );
  syncStudentHelpers(list);

  if (window.saveLocalStudents) saveLocalStudents(teacherId, list);

  const client = window.supabaseClient;
  if (client && isUuid(teacherId)) {
    await client
      .from("students")
      .update({ history, sessions: (current.sessions || 0) + 1, last_session: "Hoy" })
      .eq("id", studentId)
      .eq("teacher_id", teacherId);
  }
}

Object.assign(window, { uploadEvidence, isUuid });
