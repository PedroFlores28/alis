// RutaPedagogica.jsx — nivel actual → objetivo CNEB del grado/materia
function RutaPedagogicaView({ student, onBack, onGenerate }) {
  if (!student) {
    return (
      <div className="view">
        <div className="empty">
          <span className="empty-icon"><Icon name="target" size={30} /></span>
          <h2>Ruta Pedagógica</h2>
          <p>Selecciona un alumno para ver su punto de partida y el objetivo curricular.</p>
        </div>
      </div>
    );
  }

  const cneb = cnebForStudent(student);

  return (
    <div className="view">
      <header className="topbar">
        <div className="topbar-l topbar-l--profile">
          <button className="back-btn" onClick={onBack}>
            <Icon name="arrowLeft" size={18} /> Alumnos
          </button>
        </div>
        <div className="topbar-r">
          <button className="btn btn--primary" onClick={() => onGenerate(student)}>
            <Icon name="sparkles" size={18} /> Generar material
          </button>
        </div>
      </header>

      <div className="view-body">
        <section className="profile-hero">
          <Avatar student={student} size={64} />
          <div className="profile-hero-id">
            <div className="profile-hero-name">
              <h1>Ruta de {student.name.split(" ")[0]}</h1>
              <StatusChip status={student.status} />
            </div>
            <p className="profile-hero-meta">
              <span><Icon name="cap" size={15} /> {student.grade}</span>
              <span><Icon name="book" size={15} /> {student.subject}</span>
            </p>
          </div>
        </section>

        <section className="ruta-flow">
          <div className="ruta-node">
            <span className="ruta-node-label">Nivel actual</span>
            <p className="ruta-node-title">{student.focus || "Por definir"}</p>
            <p className="ruta-node-text">{student.note}</p>
            <span className="ruta-node-pct">{student.progress}%</span>
          </div>
          <div className="ruta-arrow" aria-hidden="true">
            <Icon name="chevron" size={22} />
          </div>
          <div className="ruta-node ruta-node--goal">
            <span className="ruta-node-label">Objetivo CNEB</span>
            <p className="ruta-node-title">{cneb ? cneb.competence : "Sin ítem CNEB"}</p>
            <p className="ruta-node-text">
              {cneb
                ? `${cneb.capacity}. ${cneb.performance}`
                : `No hay referencia CNEB para ${student.grade} / ${student.subject}.`}
            </p>
          </div>
        </section>

        <section className="panel panel--ai">
          <div className="panel-head">
            <div className="panel-head-l">
              <span className="ai-badge"><Icon name="sparkles" size={16} /></span>
              <h2 className="panel-title">Sugerencia de ruta</h2>
            </div>
          </div>
          <div className="sugg-list">
            <div className="sugg">
              <p className="sugg-title">Próximo paso recomendado</p>
              <p className="sugg-text">
                {cneb
                  ? `Partiendo de “${student.focus || "el nivel actual"}”, Alis sugiere prácticas hacia: ${cneb.capacity}. Tú eliges el tema concreto; el CNEB marca el objetivo.`
                  : `Define un enfoque para ${student.name.split(" ")[0]} y genera material de refuerzo.`}
              </p>
              <div className="sugg-foot">
                <span className="sugg-tag">CNEB</span>
                <button className="btn btn--primary btn--sm" onClick={() => onGenerate(student)}>
                  Generar práctica <Icon name="arrowUpRight" size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

Object.assign(window, { RutaPedagogicaView });
