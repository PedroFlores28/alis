// BottomNav.jsx — navegación móvil tipo barra inferior
const { useState, useEffect } = React;

function MobileAreaSheet({ activeSubject, onChange, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="bn-sheet-scrim" onClick={onClose} role="presentation">
      <div
        className="bn-sheet"
        role="dialog"
        aria-label="Elegir área"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bn-sheet-handle" />
        <div className="bn-sheet-head">
          <strong>Área curricular</strong>
          <button type="button" className="bn-sheet-close" onClick={onClose} aria-label="Cerrar">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="bn-sheet-list">
          {SUBJECTS.map((s) => {
            const count = typeof studentsOf === "function" ? studentsOf(s.id).length : 0;
            const on = s.id === activeSubject;
            return (
              <button
                key={s.id}
                type="button"
                className={"bn-sheet-opt" + (on ? " is-on" : "")}
                onClick={() => { onChange(s.id); onClose(); }}
              >
                <span className="bn-sheet-opt-icon"><Icon name={s.icon} size={18} /></span>
                <span className="bn-sheet-opt-txt">
                  <span className="bn-sheet-opt-name">{s.name}</span>
                  <span className="bn-sheet-opt-meta">{count} alumnos</span>
                </span>
                {on ? <Icon name="check" size={16} /> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobileMoreSheet({ onNavigate, onOpenProfile, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="bn-sheet-scrim" onClick={onClose} role="presentation">
      <div
        className="bn-sheet bn-sheet--compact"
        role="dialog"
        aria-label="Más opciones"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bn-sheet-handle" />
        <div className="bn-sheet-head">
          <strong>Más</strong>
          <button type="button" className="bn-sheet-close" onClick={onClose} aria-label="Cerrar">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="bn-sheet-list">
          <button
            type="button"
            className="bn-sheet-opt"
            onClick={() => { onOpenProfile?.(); onClose(); }}
          >
            <span className="bn-sheet-opt-icon"><Icon name="cap" size={18} /></span>
            <span className="bn-sheet-opt-txt">
              <span className="bn-sheet-opt-name">Perfil y plan</span>
              <span className="bn-sheet-opt-meta">Cuenta y membresía</span>
            </span>
          </button>
          <button
            type="button"
            className="bn-sheet-opt"
            onClick={() => { onNavigate({ view: "config" }); onClose(); }}
          >
            <span className="bn-sheet-opt-icon"><Icon name="settings" size={18} /></span>
            <span className="bn-sheet-opt-txt">
              <span className="bn-sheet-opt-name">Configuración</span>
              <span className="bn-sheet-opt-meta">Ajustes del panel</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function BottomNav({
  route,
  activeSubject,
  onNavigate,
  onSubject,
  onRuta,
  onUpload,
  onOpenProfile,
}) {
  const [areaOpen, setAreaOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const inStudents = route.view === "alumnos" || route.view === "perfil";
  const inRuta = route.view === "ruta";
  const inConfig = route.view === "config";
  const active = SUBJECTS.find((s) => s.id === activeSubject) || SUBJECTS[0];

  return (
    <>
      <nav className="bottom-nav" aria-label="Navegación principal">
        <button
          type="button"
          className={"bn-item" + (inStudents ? " is-active" : "")}
          onClick={() => onNavigate({ view: "alumnos" })}
        >
          <span className="bn-icon"><Icon name="students" size={22} /></span>
          <span className="bn-label">Alumnos</span>
        </button>

        <button
          type="button"
          className={"bn-item" + (inRuta ? " is-active" : "")}
          onClick={onRuta}
        >
          <span className="bn-icon"><Icon name="target" size={22} /></span>
          <span className="bn-label">Ruta</span>
        </button>

        <button
          type="button"
          className="bn-item bn-item--upload"
          onClick={onUpload}
          aria-label="Subir resultado"
        >
          <span className="bn-fab"><Icon name="upload" size={22} /></span>
          <span className="bn-label">Subir</span>
        </button>

        <button
          type="button"
          className={"bn-item" + (areaOpen ? " is-active" : "")}
          onClick={() => { setMoreOpen(false); setAreaOpen(true); }}
        >
          <span className="bn-icon"><Icon name={active.icon} size={22} /></span>
          <span className="bn-label">{active.name.split(" ")[0]}</span>
        </button>

        <button
          type="button"
          className={"bn-item" + (inConfig || moreOpen ? " is-active" : "")}
          onClick={() => { setAreaOpen(false); setMoreOpen(true); }}
        >
          <span className="bn-icon"><Icon name="settings" size={22} /></span>
          <span className="bn-label">Más</span>
        </button>
      </nav>

      {areaOpen && (
        <MobileAreaSheet
          activeSubject={activeSubject}
          onChange={onSubject}
          onClose={() => setAreaOpen(false)}
        />
      )}
      {moreOpen && (
        <MobileMoreSheet
          onNavigate={onNavigate}
          onOpenProfile={onOpenProfile}
          onClose={() => setMoreOpen(false)}
        />
      )}
    </>
  );
}

Object.assign(window, { BottomNav });
