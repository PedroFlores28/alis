// Sidebar.jsx — área curricular + navegación
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

function Sidebar({ route, teacher, activeSubject, onNavigate, onSubject, onRuta, planName, onOpenProfile, onLogout }) {
  const inStudents = route.view === "alumnos" || route.view === "perfil";
  const inRuta = route.view === "ruta";
  const count = studentsOf(activeSubject).length;
  const teacherName = teacher?.name || TEACHER.name;
  const teacherInitials = teacherName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || TEACHER.initials;

  return (
    <aside className="sidebar">
      <button type="button" className="sb-brand" onClick={() => onNavigate({ view: "alumnos" })} title="Ir a Alumnos">
        <img src={(window.__resources && window.__resources.alisLogo) || "assets/alis-logo.png"} alt="ALIS by Fibee" className="sb-logo" />
      </button>

      <AreaSelector activeSubject={activeSubject} onChange={onSubject} />

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

      <button className="sb-profile" type="button" onClick={onOpenProfile} title="Abrir perfil y membresía">
        <div className="sb-avatar">{teacherInitials}</div>
        <div className="sb-profile-meta">
          <span className="sb-profile-name">{teacherName}</span>
          <span className="sb-profile-plan"><span className="sb-plan-dot" />Plan {planName || "Aula"}</span>
        </div>
        <span className="sb-profile-chev"><Icon name="chevron" size={16} /></span>
      </button>
      <button className="sb-logout" type="button" onClick={onLogout}>
        <Icon name="arrowLeft" size={15} />
        <span>Cerrar sesión</span>
      </button>
    </aside>
  );
}

Object.assign(window, { Sidebar });
