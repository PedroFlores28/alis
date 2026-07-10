// StudentProfile.jsx — individual student profile view
function ProfileTopbar({ student, onBack, onUpload, onGenerate, onEdit }) {
  return (
    <header className="topbar">
      <div className="topbar-l topbar-l--profile">
        <button className="back-btn" onClick={onBack}>
          <Icon name="arrowLeft" size={18} /> Alumnos
        </button>
      </div>
      <div className="topbar-r">
        <button className="btn btn--ghost" onClick={() => onEdit?.(student)}>
          <Icon name="pencil" size={18} /> Editar
        </button>
        <button className="btn btn--ghost" onClick={() => onUpload(student)}>
          <Icon name="upload" size={18} /> Subir resultado
        </button>
        <button className="btn btn--primary" onClick={() => onGenerate(student)}>
          <Icon name="sparkles" size={18} /> Generar material
        </button>
      </div>
    </header>
  );
}

function StudentProfile({ student, onBack, onUpload, onGenerate, onEdit }) {
  const s = STATUS[student.status];
  return (
    <div className="view">
      <ProfileTopbar student={student} onBack={onBack} onUpload={onUpload} onGenerate={onGenerate} onEdit={onEdit} />
      <div className="view-body">
        {/* Identity header */}
        <section className="profile-hero">
          <Avatar student={student} size={72} />
          <div className="profile-hero-id">
            <div className="profile-hero-name">
              <h1>{student.name}</h1>
              <StatusChip status={student.status} />
            </div>
            <p className="profile-hero-meta">
              <span><Icon name="cap" size={15} /> {student.grade}</span>
              <span><Icon name="book" size={15} /> {student.subject}</span>
              <span><Icon name="clock" size={15} /> {student.sessions} sesiones</span>
              <span><Icon name="calendar" size={15} /> Próxima: {student.nextSession}</span>
            </p>
          </div>
          <div className="profile-hero-ring">
            <ProgressRing value={student.progress} status={student.status} size={92} stroke={9} />
            <span className="profile-hero-ring-label">Progreso general</span>
          </div>
        </section>

        {/* AI focus callout */}
        <section className="profile-ai">
          <span className="ai-badge ai-badge--lg"><Icon name="sparkles" size={18} /></span>
          <div className="profile-ai-body">
            <p className="profile-ai-title">Lectura de Alis</p>
            <p className="profile-ai-text">{student.note} Enfoque sugerido: <strong>{student.focus}</strong>.</p>
          </div>
          <button className="btn btn--primary btn--sm" onClick={() => onGenerate(student)}>
            <Icon name="sparkles" size={15} /> Generar refuerzo
          </button>
        </section>

        <div className="grid-2 grid-2--profile">
          {/* Topics breakdown */}
          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Dominio por tema</h2>
              <span className="panel-sub-inline">{student.subject} · {student.grade}</span>
            </div>
            <div className="topics">
              {student.topics.map((tp) => {
                const st = tp.score >= 75 ? "destacado" : tp.score >= 60 ? "normal" : tp.score >= 50 ? "atencion" : "riesgo";
                return (
                  <div className="topic" key={tp.name}>
                    <span className="topic-name">{tp.name}</span>
                    <div className="topic-bar"><ProgressBar value={tp.score} status={st} /></div>
                    <span className="topic-score">{tp.score}%</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent history */}
          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Resultados recientes</h2>
              <button className="link-btn">Historial</button>
            </div>
            <div className="history">
              {(student.history || []).length ? student.history.map((h, i) => {
                const st = h.score == null ? "normal" : h.score >= 75 ? "destacado" : h.score >= 60 ? "normal" : h.score >= 50 ? "atencion" : "riesgo";
                return (
                  <div className="hrow" key={i}>
                    <span className="hrow-icon"><Icon name="file" size={17} /></span>
                    <span className="hrow-main">
                      <span className="hrow-label">{h.label}</span>
                      <span className="hrow-meta">{h.type}{h.fileName ? ` · ${h.fileName}` : ""} · {h.date}</span>
                    </span>
                    <span className="hrow-score" style={{ color: STATUS[st].dot }}>
                      {h.score == null ? "—" : h.score + "%"}
                    </span>
                  </div>
                );
              }) : (
                <div className="sugg-empty"><Icon name="file" size={18} /> Aún no hay resultados. Sube una evidencia para empezar el historial.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StudentProfile });
