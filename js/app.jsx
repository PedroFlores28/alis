const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "cardStyle": "barra",
  "density": "regular"
}/*EDITMODE-END*/;

function App({ onLogout }) {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [activeSubject, setActiveSubject] = useState("mate");
  const [route, setRoute] = useState({ view: "alumnos", student: null });
  const [filter, setFilter] = useState("todos");
  const [modal, setModal] = useState(null); // {type, student?, next?}

  useEffect(() => { document.documentElement.dataset.density = t.density; }, [t.density]);

  const subject = SUBJECTS.find((s) => s.id === activeSubject);
  const scopedStudents = studentsOf(activeSubject);
  const scopedSuggestions = SUGGESTIONS.filter((s) => byId(s.studentId) && byId(s.studentId).subjectId === activeSubject);
  const scopedPending = PENDING.filter((p) => byId(p.studentId) && byId(p.studentId).subjectId === activeSubject);

  const openStudent = (s) => setRoute({ view: "perfil", student: s });
  const navigate = (r) => { setRoute({ ...r, student: null }); };
  const changeSubject = (sid) => { setActiveSubject(sid); setFilter("todos"); setRoute({ view: "alumnos", student: null }); };
  const openUpload = (s) => setModal({ type: "upload", student: s || null });
  const openGenerate = (s) => setModal({ type: "generate", student: (s && s.id) ? s : null });

  // Siempre pedir alumno primero (acciones globales)
  const askStudentThen = (next) => setModal({ type: "pick", next });
  const openRutaPicker = () => askStudentThen("ruta");
  const openEvidencePicker = () => askStudentThen("evidence");

  const onPickedStudent = (student) => {
    const next = modal && modal.next;
    setModal(null);
    if (!student) return;
    if (next === "ruta") setRoute({ view: "ruta", student });
    else if (next === "evidence") setModal({ type: "upload", student });
  };

  const homeProps = { filter, setFilter, cardStyle: t.cardStyle, density: t.density };

  let content;
  if (route.view === "perfil" && route.student) {
    content = (
      <StudentProfile
        student={route.student}
        onBack={() => setRoute({ view: "alumnos", student: null })}
        onUpload={openUpload}
        onGenerate={openGenerate}
      />
    );
  } else if (route.view === "ruta") {
    content = (
      <RutaPedagogicaView
        student={route.student}
        onBack={() => setRoute({ view: "alumnos", student: null })}
        onGenerate={openGenerate}
      />
    );
  } else if (route.view === "config") {
    content = (
      <div className="view"><div className="empty">
        <span className="empty-icon"><Icon name="settings" size={30} /></span>
        <h2>Configuración</h2>
        <p>Cuenta: {TEACHER.email || TEACHER.name}. Solo vista docente (MVP).</p>
        <button className="btn btn--ghost" style={{ marginTop: 12 }} onClick={onLogout}>Cerrar sesión</button>
      </div></div>
    );
  } else {
    content = (
      <SubjectHome
        subject={subject}
        students={scopedStudents}
        suggestions={scopedSuggestions}
        pending={scopedPending}
        t={homeProps}
        onOpenStudent={openStudent}
        onUpload={openUpload}
        onGenerate={openGenerate}
        onRuta={openRutaPicker}
        onEvidence={openEvidencePicker}
      />
    );
  }

  const modalStudents = modal && modal.student ? studentsOf(modal.student.subjectId) : scopedStudents;

  return (
    <>
      <Sidebar
        route={route}
        activeSubject={activeSubject}
        onNavigate={navigate}
        onSubject={changeSubject}
        onRuta={openRutaPicker}
        onLogout={onLogout}
      />
      <main className="main">{content}</main>

      {modal && modal.type === "pick" && (
        <PickStudentModal
          title={modal.next === "ruta" ? "Ruta pedagógica" : "Subir resultado y generar material"}
          sub="Elige el alumno. En Alis todo es por alumno."
          icon={modal.next === "ruta" ? "target" : "upload"}
          students={scopedStudents}
          onPick={onPickedStudent}
          onClose={() => setModal(null)}
        />
      )}
      {modal && modal.type === "upload" && (
        <UploadModal preset={modal.student} students={modalStudents} onClose={() => setModal(null)} />
      )}
      {modal && modal.type === "generate" && (
        <GenerateModal preset={modal.student} students={modalStudents} onClose={() => setModal(null)} />
      )}

      <TweaksPanel>
        <TweakSection label="Tarjeta de alumno" />
        <TweakRadio label="Estilo" value={t.cardStyle} options={["barra", "anillo", "minimal"]} onChange={(v) => setTweak("cardStyle", v)} />
        <TweakSection label="Diseño" />
        <TweakRadio label="Densidad" value={t.density} options={["regular", "compact"]} onChange={(v) => setTweak("density", v)} />
      </TweaksPanel>
    </>
  );
}

function AlisRoot() {
  const [boot, setBoot] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let unsub = null;
    (async () => {
      try {
        await loadAlisDataFromSupabase();
      } catch (err) {
        console.error("[ALIS] No se pudo cargar Supabase:", err);
      }

      const existing = await getAlisSession();
      if (existing) {
        applyTeacherToWindow(existing);
        setSession(existing);
      }

      const client = window.supabaseClient;
      if (client?.auth?.onAuthStateChange) {
        const { data } = client.auth.onAuthStateChange((_event, authSession) => {
          if (authSession?.user) {
            const teacher = teacherFromUser(authSession.user);
            applyTeacherToWindow(teacher);
            setLocalSession(teacher);
            setSession(teacher);
          }
        });
        unsub = () => data?.subscription?.unsubscribe?.();
      }

      setBoot(false);
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  const handleLogin = (teacher) => {
    applyTeacherToWindow(teacher);
    setSession(teacher);
  };

  const handleLogout = async () => {
    await signOutAlis();
    setSession(null);
  };

  if (boot) {
    return (
      <div className="boot-screen">Cargando ALIS…</div>
    );
  }

  if (!session) {
    return <LoginView onSuccess={handleLogin} />;
  }

  return <App onLogout={handleLogout} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<AlisRoot />);
