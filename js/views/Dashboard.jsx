// Dashboard.jsx — SubjectHome: alumnos por área + competencia MINEDU
function Topbar({ subject, competence, students }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const attn = students.filter((s) => s.status === "riesgo" || s.status === "atencion").length;
  const first = TEACHER.name.split(" ")[0];
  const title = competence
    ? `C${competence.code} · ${competence.short}`
    : subject.name;
  const subLine = competence
    ? `${subject.name} · ${competence.competence}`
    : subject.name;
  return (
    <header className="topbar">
      <div className="topbar-l">
        <h1 className="topbar-title">
          <span className="topbar-subj"><Icon name={subject.icon} size={20} /></span>
          {title}
        </h1>
        <p className="topbar-sub">
          {subLine} · {greet}, {first} · {attn > 0 ? `${attn} ${attn === 1 ? "alumno necesita" : "alumnos necesitan"} atención hoy` : "todo en orden hoy"}
        </p>
      </div>
      <div className="topbar-r">
        <div className="search">
          <Icon name="search" size={18} />
          <input placeholder={`Buscar en ${competence ? competence.short : subject.name}…`} />
          <kbd>⌘K</kbd>
        </div>
        <button className="icon-pill" title="Notificaciones"><Icon name="bell" size={19} /><span className="icon-pill-dot" /></button>
      </div>
    </header>
  );
}

function KpiStrip({ students }) {
  const total = students.length;
  const avg = total ? Math.round(students.reduce((a, s) => a + (Number(s.progress) || 0), 0) / total) : 0;
  const risk = students.filter((s) => s.status === "riesgo").length;
  const attn = students.filter((s) => s.status === "atencion").length;
  const top = students.filter((s) => s.status === "destacado").length;
  const withHistory = students.filter((s) => (s.history || []).length > 0).length;
  const avgTrend = total
    ? Math.round(students.reduce((a, s) => a + (Number(s.trend) || 0), 0) / total)
    : 0;
  const trendFoot =
    !total ? "Sin alumnos aún" :
    avgTrend > 0 ? `Tendencia +${avgTrend} pts (evidencias)` :
    avgTrend < 0 ? `Tendencia ${avgTrend} pts (evidencias)` :
    withHistory ? `${withHistory} con evidencias recientes` : "Aún sin evidencias";

  const kpis = [
    { icon: "students", label: "Alumnos", value: total, foot: "En esta competencia", tone: "ink" },
    { icon: "alert", label: "Necesitan atención", value: risk + attn, foot: `${risk} en riesgo · ${attn} atención`, tone: "risk" },
    { icon: "target", label: "Progreso promedio", value: (total ? avg : 0) + "%", foot: trendFoot, tone: "brand" },
    { icon: "cap", label: "Destacados", value: top, foot: top ? "Según estado actual" : "Ninguno aún", tone: "good" },
  ];
  return (
    <section className="kpis">
      {kpis.map((k) => (
        <div className={"kpi kpi--" + k.tone} key={k.label}>
          <span className="kpi-icon"><Icon name={k.icon} size={20} /></span>
          <span className="kpi-value">{k.value}</span>
          <span className="kpi-label">{k.label}</span>
          <span className="kpi-foot">{k.foot}</span>
        </div>
      ))}
    </section>
  );
}

function SuggestionCard({ s, onOpen, onAct, onDismiss }) {
  const student = byId(s.studentId);
  if (!student) return null;
  return (
    <div className="sugg">
      <div className="sugg-top">
        <span className="sugg-tag">{s.tag}</span>
        <button className="sugg-dismiss" title="Descartar" type="button" onClick={() => onDismiss?.(s)}>
          <Icon name="x" size={15} />
        </button>
      </div>
      <div className="sugg-body">
        <p className="sugg-title">{s.title}</p>
        <p className="sugg-text">{s.body}</p>
      </div>
      <div className="sugg-foot">
        <button className="sugg-student" type="button" onClick={() => onOpen(student)}>
          <Avatar student={student} size={24} />{student.name.split(" ")[0]}
        </button>
        <button className="btn btn--primary btn--sm" type="button" onClick={() => onAct(student)}>{s.cta} <Icon name="arrowUpRight" size={15} /></button>
      </div>
    </div>
  );
}

function SubjectHome({ subject, competence, students, suggestions, pending, t, onOpenStudent, onUpload, onGenerate, onAddStudent, onDismissSuggestion }) {
  const shown = students.filter((s) => {
    if (t.filter === "todos") return true;
    if (t.filter === "riesgo") return s.status === "riesgo" || s.status === "atencion";
    return s.status === "destacado";
  });
  return (
    <div className="view">
      <Topbar subject={subject} competence={competence} students={students} />
      <div className="view-body">
        <KpiStrip students={students} />
        <div className="grid-2">
          <section className="panel">
            <div className="panel-head">
              <div className="panel-head-l"><h2 className="panel-title">Alumnos</h2><span className="panel-count">{students.length}</span></div>
              <div className="panel-head-r">
                <div className="seg">
                  {[{ id: "todos", label: "Todos" }, { id: "riesgo", label: "Atención" }, { id: "destacado", label: "Destacados" }].map((f) => (
                    <button key={f.id} className={"seg-btn" + (t.filter === f.id ? " is-on" : "")} onClick={() => t.setFilter(f.id)}>{f.label}</button>
                  ))}
                </div>
                <button className="btn btn--primary btn--sm" onClick={onAddStudent}>
                  <Icon name="plus" size={15} /> Agregar
                </button>
              </div>
            </div>
            <div className={"scards scards--" + t.cardStyle}>
              {shown.length ? shown.map((s) => (
                <StudentCard key={s.id} student={s} variant={t.cardStyle} onOpen={() => onOpenStudent(s)} onUpload={() => onUpload(s)} />
              )) : (
                <div className="scards-empty scards-empty--cta">
                  <p>{students.length ? "No hay alumnos en este filtro." : "Aún no tienes alumnos en esta competencia."}</p>
                  {!students.length && (
                    <button className="btn btn--primary btn--sm" onClick={onAddStudent}>
                      <Icon name="plus" size={15} /> Agregar alumno
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          <div className="col-side">
            <section className="panel panel--ai">
              <div className="panel-head">
                <div className="panel-head-l"><span className="ai-badge"><Icon name="sparkles" size={16} /></span><h2 className="panel-title">Sugerencias de Alis</h2></div>
              </div>
              <div className="sugg-list">
                {suggestions.length ? suggestions.map((s) => (
                  <SuggestionCard key={s.id} s={s} onOpen={onOpenStudent} onAct={onGenerate} onDismiss={onDismissSuggestion} />
                )) : <div className="sugg-empty"><Icon name="check" size={18} /> Sin sugerencias. Sube una evidencia para que Alis proponga refuerzo.</div>}
              </div>
            </section>

            <section className="panel">
              <div className="panel-head">
                <div className="panel-head-l"><h2 className="panel-title">Pendiente de revisar</h2><span className="panel-count">{pending.length}</span></div>
              </div>
              <div className="pending-list">
                {pending.length ? pending.map((p) => {
                  const student = byId(p.studentId);
                  if (!student) return null;
                  return (
                    <button className="pending" key={p.id} onClick={() => onOpenStudent(student)}>
                      <span className="pending-icon"><Icon name={p.icon} size={18} /></span>
                      <span className="pending-main"><span className="pending-label">{p.label}</span><span className="pending-meta">{student.name.split(" ")[0]} · {p.kind}</span></span>
                      <span className="pending-time">{p.time}</span>
                      <span className="pending-go"><Icon name="chevron" size={16} /></span>
                    </button>
                  );
                }) : <div className="sugg-empty"><Icon name="check" size={18} /> Nada pendiente por revisar.</div>}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SubjectHome });
