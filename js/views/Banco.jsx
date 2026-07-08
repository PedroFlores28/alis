// Banco.jsx — global material bank, organized by subject + academic level
function MaterialCard({ m, onOpen }) {
  const subj = SUBJECTS.find((s) => s.id === m.subjectId);
  const typeTone = { "Práctica": "prac", "Quiz": "quiz", "Reto": "reto" }[m.type] || "prac";
  return (
    <div className="mcard" onClick={onOpen} role="button" tabIndex={0}>
      <div className="mcard-top">
        <span className={"mtype mtype--" + typeTone}>{m.type}</span>
        {m.isNew && <span className="mnew">Nuevo</span>}
      </div>
      <p className="mcard-title">{m.title}</p>
      <div className="mcard-meta">
        <span className="mcard-subj"><Icon name={subj.icon} size={14} /> {subj.name}</span>
        <span className="mcard-dot">·</span>
        <span>{m.level}</span>
      </div>
      <div className="mcard-foot">
        <span className="mcard-items"><Icon name="file" size={14} /> {m.items} ejercicios · {m.date}</span>
        <span className="mcard-actions">
          <button className="micon" title="Ver" onClick={(e) => { e.stopPropagation(); onOpen(); }}><Icon name="eye" size={16} /></button>
          <button className="micon" title="Descargar" onClick={(e) => e.stopPropagation()}><Icon name="download" size={16} /></button>
        </span>
      </div>
    </div>
  );
}

function BancoView({ activeSubject, onGenerate }) {
  const [scope, setScope] = useState("activa"); // activa | todas
  const [typeFilter, setTypeFilter] = useState("todos");

  const base = scope === "activa" ? MATERIALS.filter((m) => m.subjectId === activeSubject) : MATERIALS;
  const filtered = typeFilter === "todos" ? base : base.filter((m) => m.type === typeFilter);

  // group by subject, then order by level
  const levelOrder = { "1° Secundaria": 1, "2° Secundaria": 2, "3° Secundaria": 3 };
  const groups = SUBJECTS.map((s) => ({
    subject: s,
    items: filtered.filter((m) => m.subjectId === s.id).sort((a, b) => (levelOrder[a.level] || 9) - (levelOrder[b.level] || 9)),
  })).filter((g) => g.items.length);

  const active = SUBJECTS.find((s) => s.id === activeSubject);

  return (
    <div className="view">
      <header className="topbar">
        <div className="topbar-l">
          <h1 className="topbar-title"><span className="topbar-subj"><Icon name="bank" size={20} /></span>Banco de Material</h1>
          <p className="topbar-sub">{MATERIALS.length} materiales · {NEW_MATERIALS} nuevos esta semana</p>
        </div>
        <div className="topbar-r">
          <div className="search"><Icon name="search" size={18} /><input placeholder="Buscar material…" /><kbd>⌘K</kbd></div>
          <button className="btn btn--primary" onClick={() => onGenerate()}><Icon name="sparkles" size={18} /> Generar material</button>
        </div>
      </header>

      <div className="view-body">
        <div className="banco-bar">
          <div className="seg">
            <button className={"seg-btn" + (scope === "activa" ? " is-on" : "")} onClick={() => setScope("activa")}>
              <Icon name={active.icon} size={15} /> {active.name}
            </button>
            <button className={"seg-btn" + (scope === "todas" ? " is-on" : "")} onClick={() => setScope("todas")}>Todas las materias</button>
          </div>
          <div className="seg">
            {["todos", "Práctica", "Quiz", "Reto"].map((tp) => (
              <button key={tp} className={"seg-btn" + (typeFilter === tp ? " is-on" : "")} onClick={() => setTypeFilter(tp)}>
                {tp === "todos" ? "Todos" : tp}
              </button>
            ))}
          </div>
        </div>

        {groups.length ? groups.map((g) => (
          <section className="banco-group" key={g.subject.id}>
            <div className="banco-group-head">
              <span className="banco-group-icon"><Icon name={g.subject.icon} size={18} /></span>
              <h2 className="banco-group-title">{g.subject.name}</h2>
              <span className="panel-count">{g.items.length}</span>
            </div>
            <div className="mcards">
              {g.items.map((m) => <MaterialCard key={m.id} m={m} onOpen={() => onGenerate()} />)}
            </div>
          </section>
        )) : (
          <div className="empty"><span className="empty-icon"><Icon name="bank" size={30} /></span><h2>Sin material aún</h2><p>Genera tu primer material con Alis para esta selección.</p></div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { BancoView });
