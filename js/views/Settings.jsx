// Settings.jsx — cuenta docente + membresías ALIS
const ALIS_PLANS = [
  {
    id: "semilla",
    name: "Semilla",
    icon: "🌱",
    price: 49,
    students: 10,
    analyses: 30,
    materials: 20,
    teachers: 1,
    description: "Para tutores que empiezan a organizar su acompañamiento.",
  },
  {
    id: "aula",
    name: "Aula",
    icon: "📚",
    price: 99,
    students: 40,
    analyses: 120,
    materials: 80,
    teachers: 1,
    recommended: true,
    description: "Para docentes con varios grupos y seguimiento frecuente.",
  },
  {
    id: "academia",
    name: "Academia",
    icon: "🏫",
    price: 199,
    students: 120,
    analyses: 400,
    materials: 250,
    teachers: 3,
    description: "Para academias o equipos docentes que trabajan juntos.",
  },
  {
    id: "institucion",
    name: "Institución",
    icon: "🏛️",
    price: null,
    students: null,
    analyses: null,
    materials: null,
    teachers: null,
    description: "Una configuración a medida para colegios e instituciones.",
  },
];

function planById(id) {
  return ALIS_PLANS.find((plan) => plan.id === id) || ALIS_PLANS[1];
}

function PlanFeature({ children }) {
  return (
    <li>
      <span className="membership-check"><Icon name="check" size={13} /></span>
      <span>{children}</span>
    </li>
  );
}

function SettingsView({ teacher, studentsCount, activePlan, onPlanChange, onLogout }) {
  const selected = planById(activePlan);
  const usage = selected.students
    ? Math.min(100, Math.round((studentsCount / selected.students) * 100))
    : 0;

  const activate = (plan) => {
    if (plan.id === "institucion") {
      alert("La cotización institucional se configura según alumnos, docentes y uso de IA.");
      return;
    }
    if (plan.id === activePlan) return;
    if (!confirm(`¿Cambiar al Plan ${plan.name} por S/ ${plan.price} al mes?`)) return;
    onPlanChange(plan.id);
  };

  return (
    <div className="view">
      <header className="topbar settings-topbar">
        <div className="topbar-l">
          <h1 className="topbar-title">
            <span className="topbar-subj"><Icon name="settings" size={20} /></span>
            Configuración
          </h1>
          <p className="topbar-sub">Cuenta docente y plan de membresía de ALIS</p>
        </div>
      </header>

      <div className="view-body settings-body">
        <section className="settings-account panel">
          <div className="settings-account-main">
            <div className="settings-account-avatar">{TEACHER.initials}</div>
            <div>
              <p className="settings-eyebrow">Cuenta docente</p>
              <h2>{teacher.name || TEACHER.name}</h2>
              <p>{teacher.email || "Cuenta vinculada con Google"}</p>
            </div>
          </div>
          <button className="btn btn--ghost" onClick={onLogout}>Cerrar sesión</button>
        </section>

        <section className="membership-current">
          <div>
            <p className="settings-eyebrow">Plan actual</p>
            <h2>Plan {selected.name} {selected.icon}</h2>
            <p>
              {selected.students
                ? `${studentsCount} de ${selected.students} alumnos activos`
                : `${studentsCount} alumnos activos · límites personalizados`}
            </p>
          </div>
          {selected.students ? (
            <div className="membership-usage" aria-label={`${usage}% del límite de alumnos`}>
              <div className="membership-usage-top">
                <span>Uso de alumnos</span>
                <strong>{usage}%</strong>
              </div>
              <div className="membership-usage-bar">
                <span style={{ width: `${usage}%` }} />
              </div>
            </div>
          ) : null}
        </section>

        <div className="membership-heading">
          <div>
            <h2>Planes para cada etapa</h2>
            <p>Todos incluyen las áreas y competencias MINEDU. Cambian los límites de uso y colaboración.</p>
          </div>
        </div>

        <section className="membership-grid">
          {ALIS_PLANS.map((plan) => {
            const isActive = plan.id === activePlan;
            return (
              <article
                key={plan.id}
                className={
                  "membership-card" +
                  (plan.recommended ? " is-recommended" : "") +
                  (isActive ? " is-active" : "")
                }
              >
                {plan.recommended ? <span className="membership-badge">Más elegido</span> : null}
                {isActive ? <span className="membership-active">✓ Activo</span> : null}

                <div className="membership-card-head">
                  <span className="membership-plan-icon">{plan.icon}</span>
                  <div>
                    <h3>{plan.name}</h3>
                    <p>{plan.description}</p>
                  </div>
                </div>

                <div className="membership-price">
                  {plan.price ? (
                    <>
                      <span>S/</span>
                      <strong>{plan.price}</strong>
                      <em>/ mes</em>
                    </>
                  ) : (
                    <strong className="membership-custom-price">A medida</strong>
                  )}
                </div>

                <ul className="membership-features">
                  <PlanFeature>{plan.students ? `Hasta ${plan.students} alumnos activos` : "Alumnos personalizados"}</PlanFeature>
                  <PlanFeature>{plan.analyses ? `${plan.analyses} análisis de evidencias al mes` : "Análisis de IA personalizados"}</PlanFeature>
                  <PlanFeature>{plan.materials ? `${plan.materials} materiales con IA al mes` : "Materiales con IA personalizados"}</PlanFeature>
                  <PlanFeature>{plan.teachers ? `${plan.teachers} ${plan.teachers === 1 ? "cuenta docente" : "cuentas docentes"}` : "Docentes según necesidad"}</PlanFeature>
                  <PlanFeature>Áreas y competencias MINEDU</PlanFeature>
                  {plan.id !== "semilla" ? <PlanFeature>Métricas completas por alumno</PlanFeature> : null}
                </ul>

                <button
                  type="button"
                  className={isActive ? "btn btn--ghost membership-btn" : "btn btn--primary membership-btn"}
                  onClick={() => activate(plan)}
                  disabled={isActive}
                >
                  {isActive ? "Plan activo" : plan.id === "institucion" ? "Solicitar cotización" : "Elegir plan"}
                </button>
              </article>
            );
          })}
        </section>

        <p className="membership-note">
          La activación es una simulación del prototipo. El cobro y los límites reales se conectarán al sistema de pagos.
        </p>
      </div>
    </div>
  );
}

function ProfileConfigModal({ teacher, studentsCount, activePlan, onPlanChange, onLogout, onClose }) {
  const [tab, setTab] = React.useState("membresia");
  const selected = planById(activePlan);
  const usage = selected.students
    ? Math.min(100, Math.round((studentsCount / selected.students) * 100))
    : 0;

  const selectPlan = (plan) => {
    if (plan.id === "institucion") {
      alert("La cotización institucional se configura según alumnos, docentes y uso de IA.");
      return;
    }
    if (plan.id === activePlan) return;
    if (!confirm(`¿Cambiar al Plan ${plan.name} por S/ ${plan.price} al mes?`)) return;
    onPlanChange(plan.id);
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <section className="profile-config-modal" onClick={(event) => event.stopPropagation()}>
        <header className="profile-config-head">
          <div className="profile-config-title">
            <Icon name="settings" size={20} />
            <h2>Configuración del sistema</h2>
          </div>
          <button className="modal-x" type="button" onClick={onClose} aria-label="Cerrar">
            <Icon name="x" size={18} />
          </button>
        </header>

        <nav className="profile-config-tabs" aria-label="Configuración de cuenta">
          {[
            { id: "perfil", label: "Perfil docente", icon: "students" },
            { id: "membresia", label: "Plan de membresía", icon: "cap" },
            { id: "uso", label: "Uso / Límites", icon: "target" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? "is-active" : ""}
              onClick={() => setTab(item.id)}
            >
              <Icon name={item.icon} size={15} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="profile-config-body">
          {tab === "perfil" ? (
            <div className="profile-tab">
              <div className="profile-identity">
                <div className="settings-account-avatar">{TEACHER.initials}</div>
                <div>
                  <h3>{teacher.name || TEACHER.name}</h3>
                  <p>{teacher.email || "Cuenta vinculada con Google"}</p>
                </div>
              </div>

              <div className="profile-info-grid">
                <div>
                  <span>Tipo de cuenta</span>
                  <strong>Docente / tutor</strong>
                </div>
                <div>
                  <span>Plan actual</span>
                  <strong>{selected.name}</strong>
                </div>
                <div>
                  <span>Alumnos registrados</span>
                  <strong>{studentsCount}</strong>
                </div>
                <div>
                  <span>Currículo</span>
                  <strong>MINEDU · CNEB</strong>
                </div>
              </div>

              <div className="profile-danger-row">
                <div>
                  <strong>Cerrar sesión</strong>
                  <p>Sal de tu cuenta de ALIS en este dispositivo.</p>
                </div>
                <button className="btn btn--ghost profile-logout" type="button" onClick={onLogout}>
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : null}

          {tab === "membresia" ? (
            <div className="profile-tab profile-membership-tab">
              <div className="profile-plans-heading">
                <h3>Planes ALIS para docentes</h3>
                <p>Escoge el plan ideal según la cantidad de alumnos y el uso de herramientas con IA.</p>
              </div>

              <div className="profile-plan-cards">
                {ALIS_PLANS.map((plan) => {
                  const isActive = plan.id === activePlan;
                  return (
                    <article
                      key={plan.id}
                      className={"profile-plan-card" + (isActive ? " is-active" : "")}
                    >
                      <div>
                        <h4>Plan {plan.name} <span>{plan.icon}</span></h4>
                        <div className="profile-card-price">
                          {plan.price ? (
                            <>
                              <strong>S/. {plan.price}</strong>
                              <span>/ mes</span>
                            </>
                          ) : (
                            <strong>A medida</strong>
                          )}
                        </div>
                        {plan.recommended ? <p className="profile-plan-picked">★ EL MÁS ELEGIDO</p> : null}
                        <ul>
                          <li>{plan.students ? `Hasta ${plan.students} alumnos` : "Alumnos ilimitados"}</li>
                          <li>{plan.analyses ? `${plan.analyses} análisis de evidencias` : "Análisis personalizados"}</li>
                          <li>{plan.materials ? `${plan.materials} materiales con IA` : "Materiales personalizados"}</li>
                          <li>{plan.teachers ? `${plan.teachers} ${plan.teachers === 1 ? "docente" : "docentes"}` : "Docentes según necesidad"}</li>
                          <li>Competencias MINEDU</li>
                        </ul>
                      </div>
                      <button
                        type="button"
                        className={"profile-card-action" + (plan.id === "institucion" ? " is-primary" : "")}
                        onClick={() => selectPlan(plan)}
                        disabled={isActive}
                      >
                        {isActive ? "Plan actual" : plan.id === "institucion" ? "Consultar" : "Elegir plan"}
                      </button>
                    </article>
                  );
                })}
              </div>

              <div className="profile-billing-note">
                <span>💡</span>
                <div>
                  <strong>Nota de facturación:</strong> Los pagos y cambios de plan se coordinarán con el equipo de ALIS.
                </div>
              </div>
            </div>
          ) : null}

          {tab === "uso" ? (
            <div className="profile-tab">
              <div className="profile-usage-summary">
                <div>
                  <p className="settings-eyebrow">Plan {selected.name}</p>
                  <h3>Uso de tu cuenta</h3>
                  <p>Resumen de capacidades incluidas en la membresía actual.</p>
                </div>
                {selected.students ? <strong>{usage}% usado</strong> : <strong>A medida</strong>}
              </div>

              <div className="profile-limit-list">
                <div className="profile-limit-row">
                  <span>Alumnos activos</span>
                  <strong>{studentsCount} / {selected.students || "Personalizado"}</strong>
                  {selected.students ? (
                    <div className="profile-limit-bar"><span style={{ width: `${usage}%` }} /></div>
                  ) : null}
                </div>
                <div className="profile-limit-row">
                  <span>Análisis de evidencias al mes</span>
                  <strong>{selected.analyses || "Personalizado"}</strong>
                </div>
                <div className="profile-limit-row">
                  <span>Materiales generados con IA al mes</span>
                  <strong>{selected.materials || "Personalizado"}</strong>
                </div>
                <div className="profile-limit-row">
                  <span>Cuentas docentes</span>
                  <strong>{selected.teachers || "Personalizado"}</strong>
                </div>
                <div className="profile-limit-row">
                  <span>Áreas y competencias MINEDU</span>
                  <strong>Incluidas</strong>
                </div>
              </div>
              <p className="profile-usage-note">
                Los contadores mensuales de IA se conectarán cuando se integre la facturación real.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { SettingsView, ProfileConfigModal, ALIS_PLANS, planById });
