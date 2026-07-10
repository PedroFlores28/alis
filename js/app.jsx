const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "cardStyle": "barra",
  "density": "regular"
}/*EDITMODE-END*/;

function App({ teacher, onLogout }) {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [activeSubject, setActiveSubject] = useState("mate");
  const [route, setRoute] = useState({ view: "alumnos", student: null });
  const [filter, setFilter] = useState("todos");
  const [modal, setModal] = useState(null);
  const [students, setStudents] = useState(() => [...(window.STUDENTS || [])]);
  const [suggestions, setSuggestions] = useState(() => [...(window.SUGGESTIONS || [])]);
  const [pending, setPending] = useState(() => [...(window.PENDING || [])]);
  const [dataReady, setDataReady] = useState(false);

  const teacherId = teacher?.id || teacher?.email;

  const pullFromWindow = () => {
    setStudents([...(window.STUDENTS || [])]);
    setSuggestions([...(window.SUGGESTIONS || [])]);
    setPending([...(window.PENDING || [])]);
  };

  useEffect(() => {
    document.documentElement.dataset.density = t.density;
  }, [t.density]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDataReady(false);
      try {
        await loadAlisDataForTeacher(teacherId);
      } catch (err) {
        console.error("[ALIS] Error cargando alumnos:", err);
      }
      if (!cancelled) {
        pullFromWindow();
        setDataReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [teacherId]);

  const subject = SUBJECTS.find((s) => s.id === activeSubject);
  const scopedStudents = students.filter((s) => s.subjectId === activeSubject);
  const studentIds = new Set(scopedStudents.map((s) => s.id));
  const scopedSuggestions = suggestions.filter((s) => studentIds.has(s.studentId));
  const scopedPending = pending.filter((p) => studentIds.has(p.studentId));

  const openStudent = (s) => setRoute({ view: "perfil", student: s });
  const navigate = (r) => { setRoute({ ...r, student: null }); };
  const changeSubject = (sid) => { setActiveSubject(sid); setFilter("todos"); setRoute({ view: "alumnos", student: null }); };
  const openUpload = (s) => setModal({ type: "upload", student: s || null });
  const openGenerate = (s) => setModal({ type: "generate", student: (s && s.id) ? s : null });
  const openAddStudent = () => setModal({ type: "student-form", student: null });
  const openEditStudent = (s) => setModal({ type: "student-form", student: s });

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

  const onStudentSaved = (saved) => {
    pullFromWindow();
    setModal(null);
    if (saved?.subjectId) setActiveSubject(saved.subjectId);
    if (route.view === "perfil" && saved) setRoute({ view: "perfil", student: saved });
  };

  const onStudentDeleted = () => {
    pullFromWindow();
    setModal(null);
    setRoute({ view: "alumnos", student: null });
  };

  const homeProps = { filter, setFilter, cardStyle: t.cardStyle, density: t.density };

  let content;
  if (!dataReady) {
    content = <div className="view"><div className="empty"><p>Cargando tus alumnos…</p></div></div>;
  } else if (route.view === "perfil" && route.student) {
    const live = students.find((s) => s.id === route.student.id) || route.student;
    content = (
      <StudentProfile
        student={live}
        onBack={() => setRoute({ view: "alumnos", student: null })}
        onUpload={openUpload}
        onGenerate={openGenerate}
        onEdit={openEditStudent}
      />
    );
  } else if (route.view === "ruta") {
    const live = route.student ? (students.find((s) => s.id === route.student.id) || route.student) : null;
    content = (
      <RutaPedagogicaView
        student={live}
        onBack={() => setRoute({ view: "alumnos", student: null })}
        onGenerate={openGenerate}
      />
    );
  } else if (route.view === "config") {
    content = (
      <div className="view"><div className="empty">
        <span className="empty-icon"><Icon name="settings" size={30} /></span>
        <h2>Configuración</h2>
        <p>Cuenta: {teacher.email || teacher.name}. Solo vista docente (MVP).</p>
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
        onAddStudent={openAddStudent}
      />
    );
  }

  const modalStudents = modal && modal.student
    ? students.filter((s) => s.subjectId === modal.student.subjectId)
    : scopedStudents;

  // Mantener helpers globales alineados con el estado React
  useEffect(() => {
    syncStudentHelpers(students);
  }, [students]);

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
        <UploadModal
          preset={modal.student}
          students={modalStudents}
          teacherId={teacherId}
          onClose={() => setModal(null)}
          onUploaded={() => pullFromWindow()}
          onGenerateReinforcement={(student) => setModal({ type: "generate", student })}
        />
      )}
      {modal && modal.type === "generate" && (
        <GenerateModal preset={modal.student} students={modalStudents} onClose={() => setModal(null)} />
      )}
      {modal && modal.type === "student-form" && (
        <StudentFormModal
          student={modal.student}
          defaultSubjectId={activeSubject}
          teacherId={teacherId}
          onSaved={onStudentSaved}
          onDeleted={onStudentDeleted}
          onClose={() => setModal(null)}
        />
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
          } else if (_event === "SIGNED_OUT") {
            setSession(null);
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
    return <div className="boot-screen">Cargando ALIS…</div>;
  }

  if (!session) {
    return <LoginView onSuccess={handleLogin} />;
  }

  return <App teacher={session} onLogout={handleLogout} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<AlisRoot />);
