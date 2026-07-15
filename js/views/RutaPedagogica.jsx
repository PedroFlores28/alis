// RutaPedagogica.jsx — nivel actual → objetivo CNEB + línea de tiempo de sesiones
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
  const path = typeof learningPathForStudent === "function"
    ? learningPathForStudent(student)
    : null;
  const sessions = path?.sessions || [];

  const kindLabel = (kind) =>
    kind === "diagnostico" ? "Diagnóstico" :
    kind === "meta" ? "Meta" : "Puente";

  const statusLabel = (status) =>
    status === "done" ? "Hecha" :
    status === "current" ? "En curso" : "Pendiente";

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
              <span><Icon name="target" size={15} /> {student.competenceLabel || (typeof studentCompetenceLabel === "function" ? studentCompetenceLabel(student) : student.subject)}</span>
              <span><Icon name="book" size={15} /> {student.subject}</span>
              {student.grade ? <span><Icon name="cap" size={15} /> {student.grade}</span> : null}
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
                : `No hay referencia CNEB para esta competencia / ${student.subject}.`}
            </p>
          </div>
        </section>

        <section className="panel panel--ai">
          <div className="panel-head">
            <div className="panel-head-l">
              <span className="ai-badge"><Icon name="sparkles" size={16} /></span>
              <h2 className="panel-title">Línea de sesiones</h2>
            </div>
            {path?.estimate ? (
              <span className="panel-sub-inline">
                ~{path.estimate} {path.estimate === 1 ? "sesión" : "sesiones"} hacia la meta
              </span>
            ) : null}
          </div>

          <p className="ruta-timeline-lead">
            Del más básico al objetivo. Si la evidencia muestra huecos previos, primero se recuperan esas bases.
          </p>

          <div className="ruta-timeline">
            {sessions.map((s, i) => (
              <div
                key={s.id || i}
                className={
                  "ruta-step" +
                  (s.status === "done" ? " is-done" : "") +
                  (s.status === "current" ? " is-current" : "") +
                  (s.kind === "meta" ? " is-meta" : "")
                }
              >
                <div className="ruta-step-rail" aria-hidden="true">
                  <span className="ruta-step-dot">{s.status === "done" ? <Icon name="check" size={12} /> : s.order}</span>
                  {i < sessions.length - 1 ? <span className="ruta-step-line" /> : null}
                </div>
                <div className="ruta-step-card">
                  <div className="ruta-step-top">
                    <span className="ruta-step-kind">{kindLabel(s.kind)}</span>
                    <span className="ruta-step-status">{statusLabel(s.status)}</span>
                  </div>
                  <p className="ruta-step-title">{s.title}</p>
                  <p className="ruta-step-why">{s.why}</p>
                  {s.kind !== "diagnostico" ? (
                    <div className="ruta-step-actions">
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={() => onGenerate(student, {
                          topicTitle: s.title,
                          next: s.why,
                          summary: `Sesión ${s.order}: ${s.title}. ${s.why}`,
                        })}
                      >
                        Generar práctica <Icon name="arrowUpRight" size={15} />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

Object.assign(window, { RutaPedagogicaView });
