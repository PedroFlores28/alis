// auth.js — sesión del docente (Google)
const ALIS_SESSION_KEY = "alis_teacher_session";

function getLocalSession() {
  try {
    const raw = localStorage.getItem(ALIS_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalSession(session) {
  localStorage.setItem(ALIS_SESSION_KEY, JSON.stringify(session));
}

function clearLocalSession() {
  localStorage.removeItem(ALIS_SESSION_KEY);
}

function teacherFromUser(user) {
  const email = user?.email || "";
  const meta = user?.user_metadata || {};
  const name =
    meta.full_name ||
    meta.name ||
    (email ? email.split("@")[0].replace(/[._]/g, " ") : "Docente");
  const pretty = String(name).replace(/\b\w/g, (c) => c.toUpperCase());
  const parts = pretty.split(" ").filter(Boolean);
  const initials = ((parts[0]?.[0] || "D") + (parts[1]?.[0] || "")).toUpperCase();
  return { name: pretty, plan: "Plan Tutor", initials, email };
}

function teacherFromEmail(email) {
  return teacherFromUser({ email });
}

async function getAlisSession() {
  const client = window.supabaseClient;
  if (client) {
    try {
      const { data } = await client.auth.getSession();
      if (data?.session?.user) {
        const teacher = teacherFromUser(data.session.user);
        setLocalSession(teacher);
        return teacher;
      }
    } catch (_) {}
  }
  return getLocalSession();
}

async function signInWithGoogle() {
  const client = window.supabaseClient;
  if (!client?.auth?.signInWithOAuth) {
    throw new Error("Supabase no está configurado. Revisa js/config.js.");
  }

  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + window.location.pathname,
      queryParams: { access_type: "offline", prompt: "select_account" },
    },
  });

  if (error) throw new Error(error.message);
  return { mode: "oauth" };
}

async function signOutAlis() {
  const client = window.supabaseClient;
  if (client?.auth?.signOut) {
    try { await client.auth.signOut(); } catch (_) {}
  }
  clearLocalSession();
}

function applyTeacherToWindow(teacher) {
  if (!teacher) return;
  window.TEACHER = {
    name: teacher.name,
    plan: teacher.plan || "Plan Tutor",
    initials: teacher.initials,
    email: teacher.email,
  };
}

Object.assign(window, {
  getAlisSession,
  signInWithGoogle,
  signOutAlis,
  applyTeacherToWindow,
  teacherFromEmail,
  teacherFromUser,
  setLocalSession,
});
