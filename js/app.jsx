const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "cardStyle": "barra",
  "density": "regular"
}/*EDITMODE-END*/;

function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [activeSubject, setActiveSubject] = useState("mate");
  const [route, setRoute] = useState({ view:"alumnos", student:null });
  const [filter, setFilter] = useState("todos");
  const [modal, setModal] = useState(null); // {type, student}

  useEffect(()=>{ document.documentElement.dataset.density = t.density; }, [t.density]);

  const subject = SUBJECTS.find(s=>s.id===activeSubject);
  const scopedStudents = studentsOf(activeSubject);
  const scopedSuggestions = SUGGESTIONS.filter(s=>byId(s.studentId) && byId(s.studentId).subjectId===activeSubject);
  const scopedPending = PENDING.filter(p=>byId(p.studentId) && byId(p.studentId).subjectId===activeSubject);

  const openStudent = (s)=> setRoute({ view:"perfil", student:s });
  const navigate = (r)=>{ setRoute({ ...r, student:null }); };
  const changeSubject = (sid)=>{ setActiveSubject(sid); setFilter("todos"); setRoute({ view:"alumnos", student:null }); };
  const openUpload = (s)=> setModal({ type:"upload", student:s||null });
  const openGenerate = (s)=> setModal({ type:"generate", student:(s&&s.id)?s:null });

  const homeProps = { filter, setFilter, cardStyle:t.cardStyle, density:t.density };

  let content;
  if(route.view==="perfil" && route.student){
    content = <StudentProfile student={route.student} onBack={()=>setRoute({view:"alumnos",student:null})} onUpload={openUpload} onGenerate={openGenerate} />;
  } else if(route.view==="banco"){
    content = <BancoView activeSubject={activeSubject} onGenerate={openGenerate} />;
  } else if(route.view==="config"){
    content = (
      <div className="view"><div className="empty">
        <span className="empty-icon"><Icon name="settings" size={30} /></span>
        <h2>Configuración</h2>
        <p>Ajustes de cuenta, plan y preferencias de Alis. Próximamente.</p>
      </div></div>
    );
  } else {
    content = <SubjectHome subject={subject} students={scopedStudents} suggestions={scopedSuggestions} pending={scopedPending}
      t={homeProps} onOpenStudent={openStudent} onUpload={openUpload} onGenerate={openGenerate} />;
  }

  // modal student list: scoped to active subject, but if preset belongs elsewhere include its subject's list
  const modalStudents = modal && modal.student ? studentsOf(modal.student.subjectId) : scopedStudents;

  return (
    <>
      <Sidebar route={route} activeSubject={activeSubject} onNavigate={navigate} onSubject={changeSubject} />
      <main className="main">{content}</main>

      {modal && modal.type==="upload" && <UploadModal preset={modal.student} students={modalStudents} onClose={()=>setModal(null)} />}
      {modal && modal.type==="generate" && <GenerateModal preset={modal.student} students={modalStudents} onClose={()=>setModal(null)} />}

      <TweaksPanel>
        <TweakSection label="Tarjeta de alumno" />
        <TweakRadio label="Estilo" value={t.cardStyle} options={["barra","anillo","minimal"]} onChange={(v)=>setTweak("cardStyle",v)} />
        <TweakSection label="Diseño" />
        <TweakRadio label="Densidad" value={t.density} options={["regular","compact"]} onChange={(v)=>setTweak("density",v)} />
      </TweaksPanel>
    </>
  );
}

function AlisRoot() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await loadAlisDataFromSupabase();
      } catch (err) {
        console.error("[ALIS] No se pudo cargar Supabase:", err);
      }
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#8A8A8A", fontFamily: "Outfit, system-ui, sans-serif" }}>
        Cargando ALIS…
      </div>
    );
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<AlisRoot />);
