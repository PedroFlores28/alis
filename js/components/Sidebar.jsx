// Sidebar.jsx — área curricular + competencia MINEDU + navegación
const { useState } = React;

function AreaSelector({ activeSubject, onChange }) {
  const [open, setOpen] = useState(false);
  const active = SUBJECTS.find((s) => s.id === activeSubject) || SUBJECTS[0];
  return (
    <div className="subj">
      <span className="sb-section-label">Área</span>
      <button className={"subj-trigger" + (open ? " is-open" : "")} onClick={() => setOpen(!open)}>
        <span className="subj-icon"><Icon name={active.icon} size={20} /></span>
        <span className="subj-name">{active.name}</span>
        <span className={"subj-chev" + (open ? " is-open" : "")}><Icon name="chevronDown" size={17} /></span>
      </button>
      {open && (
        <>
          <div className="subj-backdrop" onClick={() => setOpen(false)} />
          <div className="subj-menu">
            {SUBJECTS.map((s) => {
              const count = studentsOf(s.id).length;
              return (
                <button
                  key={s.id}
                  className={"subj-opt" + (s.id === activeSubject ? " is-on" : "")}
                  onClick={() => { onChange(s.id); setOpen(false); }}
                >
                  <span className="subj-opt-icon"><Icon name={s.icon} size={18} /></span>
                  <span className="subj-opt-txt">
                    <span className="subj-opt-name">{s.name}</span>
                    <span className="subj-opt-meta">{count} alumnos</span>
                  </span>
                  {s.id === activeSubject && <span className="subj-opt-check"><Icon name="check" size={15} /></span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function CompetenceSelector({ activeSubject, activeCompetence, onChange }) {
  const [open, setOpen] = useState(false);
  const list = typeof competenciesOf === "function" ? competenciesOf(activeSubject) : [];
  const active = list.find((c) => c.id === activeCompetence) || list[0];
  if (!active) return null;

  const countFor = (cid) => {
    if (typeof studentsOfCompetence === "function") {
      return studentsOfCompetence(cid, activeSubject).length;
    }
    return (window.STUDENTS || []).filter((s) => s.competenceId === cid || (!s.competenceId && s.subjectId === activeSubject && cid === list[0]?.id)).length;
  };

  return (
    <div className="subj">
      <span className="sb-section-label">Competencia MINEDU</span>
      <button className={"subj-trigger" + (open ? " is-open" : "")} onClick={() => setOpen(!open)}>
        <span className="subj-icon"><Icon name="target" size={20} /></span>
        <span className="subj-name">C{active.code} · {active.short}</span>
        <span className={"subj-chev" + (open ? " is-open" : "")}><Icon name="chevronDown" size={17} /></span>
      </button>
      {open && (
        <>
          <div className="subj-backdrop" onClick={() => setOpen(false)} />
          <div className="subj-menu subj-menu--wide">
            {list.map((c) => (
              <button
                key={c.id}
                className={"subj-opt" + (c.id === active.id ? " is-on" : "")}
                onClick={() => { onChange(c.id); setOpen(false); }}
              >
                <span className="subj-opt-icon"><Icon name="target" size={18} /></span>
                <span className="subj-opt-txt">
                  <span className="subj-opt-name">C{c.code} · {c.short}</span>
                  <span className="subj-opt-meta">{c.competence} · {countFor(c.id)} alumnos</span>
                </span>
                {c.id === active.id && <span className="subj-opt-check"><Icon name="check" size={15} /></span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Sidebar({ route, activeSubject, activeCompetence, onNavigate, onSubject, onCompetence, onRuta, onLogout }) {
  const inStudents = route.view === "alumnos" || route.view === "perfil";
  const inRuta = route.view === "ruta";
  const count = typeof studentsOfCompetence === "function"
    ? studentsOfCompetence(activeCompetence, activeSubject).length
    : studentsOf(activeSubject).length;

  return (
    <aside className="sidebar">
      <button type="button" className="sb-brand" onClick={() => onNavigate({ view: "alumnos" })} title="Ir a Alumnos">
        <img src={(window.__resources && window.__resources.alisLogo) || "assets/alis-logo.png"} alt="ALIS by Fibee" className="sb-logo" />
      </button>

      <AreaSelector activeSubject={activeSubject} onChange={onSubject} />
      <CompetenceSelector
        activeSubject={activeSubject}
        activeCompetence={activeCompetence}
        onChange={onCompetence}
      />

      <div className="sb-divider" />

      <nav className="sb-nav">
        <span className="sb-section-label">Navegación</span>
        <button className={"sb-link" + (inStudents ? " is-active" : "")} onClick={() => onNavigate({ view: "alumnos" })}>
          <span className="sb-link-icon"><Icon name="students" size={20} /></span>
          <span className="sb-link-label">Alumnos</span>
          <span className="sb-link-count">{count}</span>
        </button>
        <button className={"sb-link" + (inRuta ? " is-active" : "")} onClick={onRuta}>
          <span className="sb-link-icon"><Icon name="target" size={20} /></span>
          <span className="sb-link-label">Ruta Pedagógica</span>
        </button>
      </nav>

      <div className="sb-spacer" />

      <button className={"sb-link sb-link--settings" + (route.view === "config" ? " is-active" : "")} onClick={() => onNavigate({ view: "config" })}>
        <span className="sb-link-icon"><Icon name="settings" size={20} /></span>
        <span className="sb-link-label">Configuración</span>
      </button>

      <div className="sb-profile" role="button" tabIndex={0} onClick={onLogout} title="Cerrar sesión">
        <div className="sb-avatar">{TEACHER.initials}</div>
        <div className="sb-profile-meta">
          <span className="sb-profile-name">{TEACHER.name}</span>
          <span className="sb-profile-plan"><span className="sb-plan-dot" />{TEACHER.plan}</span>
        </div>
        <span className="sb-profile-chev"><Icon name="chevronDown" size={16} /></span>
      </div>
    </aside>
  );
}

Object.assign(window, { Sidebar });
