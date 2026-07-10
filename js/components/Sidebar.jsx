// Sidebar.jsx — subject selector (dropdown) + contextual navigation
const { useState } = React;

function SubjectSelector({ activeSubject, onChange }) {
  const [open, setOpen] = useState(false);
  const active = SUBJECTS.find((s) => s.id === activeSubject);
  return (
    <div className="subj">
      <span className="sb-section-label">Materia</span>
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
            <div className="subj-menu-foot">
              <button className="subj-add"><Icon name="plus" size={15} /> Añadir materia</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Sidebar({ route, activeSubject, onNavigate, onSubject, onRuta, onLogout }) {
  const inStudents = route.view === "alumnos" || route.view === "perfil";
  const inRuta = route.view === "ruta";
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <img src={(window.__resources && window.__resources.alisLogo) || "assets/alis-logo.png"} alt="ALIS by Fibee" className="sb-logo" />
      </div>

      <SubjectSelector activeSubject={activeSubject} onChange={onSubject} />

      <div className="sb-divider" />

      <nav className="sb-nav">
        <span className="sb-section-label">Navegación</span>
        <button className={"sb-link" + (inStudents ? " is-active" : "")} onClick={() => onNavigate({ view: "alumnos" })}>
          <span className="sb-link-icon"><Icon name="students" size={20} /></span>
          <span className="sb-link-label">Alumnos</span>
          <span className="sb-link-count">{studentsOf(activeSubject).length}</span>
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
