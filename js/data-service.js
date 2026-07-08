function mapStudent(row, subjects) {
  const subj = subjects.find((s) => s.id === row.subject_id);
  return {
    id: row.id,
    subjectId: row.subject_id,
    name: row.name,
    initials: row.initials,
    grade: row.grade,
    subject: subj ? subj.name : row.subject_id,
    progress: row.progress,
    status: row.status,
    trend: row.trend,
    avatarHue: row.avatar_hue,
    nextSession: row.next_session,
    sessions: row.sessions,
    focus: row.focus,
    note: row.note,
    topics: row.topics || [],
    history: row.history || [],
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

function mapMaterial(row) {
  return {
    id: row.id,
    subjectId: row.subject_id,
    type: row.type,
    title: row.title,
    level: row.level,
    items: row.items,
    date: row.date,
    isNew: row.is_new,
  };
}

async function loadAlisDataFromSupabase() {
  const client = window.supabaseClient;
  if (!client) return false;

  const [subjectsRes, studentsRes, suggestionsRes, pendingRes, materialsRes] = await Promise.all([
    client.from("subjects").select("*").order("id"),
    client.from("students").select("*").order("name"),
    client.from("suggestions").select("*"),
    client.from("pending").select("*"),
    client.from("materials").select("*"),
  ]);

  const errors = [subjectsRes, studentsRes, suggestionsRes, pendingRes, materialsRes]
    .filter((r) => r.error)
    .map((r) => r.error.message);

  if (errors.length) {
    console.error("[ALIS] Error cargando Supabase:", errors.join("; "));
    return false;
  }

  const subjects = (subjectsRes.data || []).map((s) => ({
    id: s.id,
    name: s.name,
    short: s.short,
    icon: s.icon,
  }));

  if (!(studentsRes.data || []).length) {
    console.warn("[ALIS] Supabase sin alumnos — usando datos locales de respaldo.");
    return false;
  }

  window.SUBJECTS = subjects;
  window.STUDENTS = (studentsRes.data || []).map((r) => mapStudent(r, subjects));
  window.SUGGESTIONS = (suggestionsRes.data || []).map(mapSuggestion);
  window.PENDING = (pendingRes.data || []).map(mapPending);
  window.MATERIALS = (materialsRes.data || []).map(mapMaterial);
  window.NEW_MATERIALS = window.MATERIALS.filter((m) => m.isNew).length;

  window.byId = (id) => window.STUDENTS.find((s) => s.id === id);
  window.studentsOf = (sid) => window.STUDENTS.filter((s) => s.subjectId === sid);

  return true;
}
