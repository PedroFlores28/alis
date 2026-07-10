// data-service.js — carga y CRUD de alumnos por docente

function mapStudent(row, subjects) {
  const subj = (subjects || window.SUBJECTS || []).find((s) => s.id === row.subject_id);
  return {
    id: row.id,
    subjectId: row.subject_id,
    name: row.name,
    initials: row.initials,
    grade: row.grade,
    subject: subj ? subj.name : row.subject_id,
    progress: row.progress ?? 0,
    status: row.status || "normal",
    trend: row.trend ?? 0,
    avatarHue: row.avatar_hue ?? 200,
    nextSession: row.next_session || "Por agendar",
    sessions: row.sessions ?? 0,
    focus: row.focus || "",
    note: row.note || "",
    topics: row.topics || [],
    history: row.history || [],
    teacherId: row.teacher_id || null,
  };
}

function mapSuggestion(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    title: row.title,
    body: row.body,
    tag: row.tag,
    cta: row.cta,
  };
}

function mapPending(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    label: row.label,
    kind: row.kind,
    time: row.time,
    icon: row.icon,
  };
}

function syncStudentHelpers(list) {
  window.STUDENTS = list;
  window.byId = (id) => window.STUDENTS.find((s) => s.id === id);
  window.studentsOf = (sid) => window.STUDENTS.filter((s) => s.subjectId === sid);
}

function localStudentsKey(teacherId) {
  return "alis_students_" + (teacherId || "anon");
}

function loadLocalStudents(teacherId) {
  try {
    const raw = localStorage.getItem(localStudentsKey(teacherId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStudents(teacherId, list) {
  localStorage.setItem(localStudentsKey(teacherId), JSON.stringify(list));
}

function isTeacherUuid(v) {
  return typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

function initialsFromName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "AL";
  return ((parts[0][0] || "") + (parts[1]?.[0] || parts[0][1] || "")).toUpperCase();
}

function slugId(name) {
  const base = String(name || "alumno")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24) || "alumno";
  return base + "-" + Math.random().toString(36).slice(2, 7);
}

function applySubjects(rows) {
  if (!rows?.length) return;
  window.SUBJECTS = rows.map((s) => ({
    id: s.id,
    name: s.name,
    short: s.short,
    icon: s.icon,
  }));
}

async function loadSubjectsFromSupabase() {
  const client = window.supabaseClient;
  if (!client) return false;
  const { data, error } = await client.from("subjects").select("*").order("id");
  if (error) {
    console.warn("[ALIS] subjects:", error.message);
    return false;
  }
  if (data?.length) applySubjects(data);
  return true;
}

/** Carga datos del docente autenticado (solo sus alumnos). */
async function loadAlisDataForTeacher(teacherId) {
  const client = window.supabaseClient;

  if (!teacherId) {
    syncStudentHelpers([]);
    window.SUGGESTIONS = [];
    window.PENDING = [];
    return { ok: false, source: "none" };
  }

  if (client) {
    await loadSubjectsFromSupabase();
    if (typeof loadCneb === "function") await loadCneb();

    let studentsQuery = client.from("students").select("*").order("name");
    // Filtrar por docente si la columna existe / RLS aplica
    const filterId = isTeacherUuid(teacherId) ? teacherId : null;
    const { data, error } = filterId
      ? await studentsQuery.eq("teacher_id", filterId)
      : { data: null, error: { message: "teacher_id no UUID" } };

    if (!error) {
      const list = (data || []).map((r) => mapStudent(r, window.SUBJECTS));
      syncStudentHelpers(list);

      const ids = new Set(list.map((s) => s.id));
      const [sugRes, pendRes] = await Promise.all([
        client.from("suggestions").select("*"),
        client.from("pending").select("*"),
      ]);
      const remoteSug = (sugRes.data || []).map(mapSuggestion);
      const remotePend = (pendRes.data || []).map(mapPending);
      if (typeof mergeTeacherFeed === "function") {
        mergeTeacherFeed(teacherId, remoteSug, remotePend, ids);
      } else {
        window.SUGGESTIONS = remoteSug.filter((s) => ids.has(s.studentId));
        window.PENDING = remotePend.filter((p) => ids.has(p.studentId));
      }

      return { ok: true, source: "supabase", count: list.length };
    }

    // Columna teacher_id aún no migrada u otro error → local
    console.warn("[ALIS] Alumnos Supabase:", error.message, "— usando almacenamiento local del docente.");
  }

  if (typeof loadCneb === "function") await loadCneb();
  const local = loadLocalStudents(teacherId);
  syncStudentHelpers(local);
  if (typeof mergeTeacherFeed === "function") {
    mergeTeacherFeed(teacherId, [], [], local.map((s) => s.id));
  } else {
    window.SUGGESTIONS = [];
    window.PENDING = [];
  }
  return { ok: true, source: "local", count: local.length };
}

async function createStudent(payload, teacherId) {
  const name = String(payload.name || "").trim();
  if (!name) throw new Error("El nombre es obligatorio.");
  if (!payload.subjectId) throw new Error("Elige una materia.");
  if (!payload.grade) throw new Error("Elige un grado.");
  if (!teacherId) throw new Error("Sesión de docente no válida.");

  const subj = (window.SUBJECTS || []).find((s) => s.id === payload.subjectId);
  const row = {
    id: slugId(name),
    subject_id: payload.subjectId,
    name,
    initials: initialsFromName(name),
    grade: payload.grade,
    progress: 0,
    status: "normal",
    trend: 0,
    avatar_hue: Math.floor(Math.random() * 360),
    last_session: "Sin sesiones",
    next_session: "Por agendar",
    sessions: 0,
    focus: String(payload.focus || "").trim() || "Por definir",
    note: String(payload.note || "").trim() || "Alumno nuevo. Alis irá armando la lectura con las evidencias.",
    topics: [],
    history: [],
  };
  if (isTeacherUuid(teacherId)) row.teacher_id = teacherId;

  const client = window.supabaseClient;
  if (client && isTeacherUuid(teacherId)) {
    const { data, error } = await client.from("students").insert(row).select("*").single();
    if (!error && data) {
      const student = mapStudent(data, window.SUBJECTS);
      const list = [...(window.STUDENTS || []), student];
      syncStudentHelpers(list);
      saveLocalStudents(teacherId, list);
      return student;
    }
    const msg = error?.message || "No se pudo guardar en Supabase.";
    console.warn("[ALIS] createStudent Supabase:", msg);
    throw new Error(
      "No se pudo guardar el alumno en la nube. " +
      "Ejecuta supabase/mvp-setup.sql en el SQL Editor de Supabase. Detalle: " + msg
    );
  }

  const student = mapStudent(row, window.SUBJECTS);
  const list = [...(window.STUDENTS || []), student];
  syncStudentHelpers(list);
  saveLocalStudents(teacherId, list);
  return student;
}

async function updateStudent(studentId, payload, teacherId) {
  if (!studentId) throw new Error("Alumno no válido.");
  const name = String(payload.name || "").trim();
  if (!name) throw new Error("El nombre es obligatorio.");

  const patch = {
    name,
    initials: initialsFromName(name),
    subject_id: payload.subjectId,
    grade: payload.grade,
    focus: String(payload.focus || "").trim() || "Por definir",
    note: String(payload.note || "").trim(),
  };

  const client = window.supabaseClient;
  if (client && isTeacherUuid(teacherId)) {
    const { data, error } = await client
      .from("students")
      .update(patch)
      .eq("id", studentId)
      .eq("teacher_id", teacherId)
      .select("*")
      .single();
    if (!error && data) {
      const student = mapStudent(data, window.SUBJECTS);
      const list = (window.STUDENTS || []).map((s) => (s.id === studentId ? student : s));
      syncStudentHelpers(list);
      saveLocalStudents(teacherId, list);
      return student;
    }
    const msg = error?.message || "No se pudo actualizar en Supabase.";
    console.warn("[ALIS] updateStudent Supabase:", msg);
    throw new Error("No se pudo actualizar el alumno. Detalle: " + msg);
  }

  const list = (window.STUDENTS || []).map((s) => {
    if (s.id !== studentId) return s;
    const subj = (window.SUBJECTS || []).find((x) => x.id === payload.subjectId);
    return {
      ...s,
      name,
      initials: initialsFromName(name),
      subjectId: payload.subjectId,
      subject: subj ? subj.name : payload.subjectId,
      grade: payload.grade,
      focus: patch.focus,
      note: patch.note,
    };
  });
  syncStudentHelpers(list);
  saveLocalStudents(teacherId, list);
  return list.find((s) => s.id === studentId);
}

async function deleteStudent(studentId, teacherId) {
  if (!studentId) throw new Error("Alumno no válido.");

  const client = window.supabaseClient;
  if (client && isTeacherUuid(teacherId)) {
    const { error } = await client
      .from("students")
      .delete()
      .eq("id", studentId)
      .eq("teacher_id", teacherId);
    if (error) {
      console.warn("[ALIS] deleteStudent Supabase:", error.message);
      throw new Error("No se pudo eliminar el alumno. Detalle: " + error.message);
    }
    const list = (window.STUDENTS || []).filter((s) => s.id !== studentId);
    syncStudentHelpers(list);
    saveLocalStudents(teacherId, list);
    return true;
  }

  const list = (window.STUDENTS || []).filter((s) => s.id !== studentId);
  syncStudentHelpers(list);
  saveLocalStudents(teacherId, list);
  return true;
}

Object.assign(window, {
  mapStudent,
  loadAlisDataForTeacher,
  createStudent,
  updateStudent,
  deleteStudent,
  syncStudentHelpers,
  initialsFromName,
  saveLocalStudents,
  isTeacherUuid,
});
