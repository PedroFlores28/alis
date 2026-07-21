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
const ALIS_INSTITUTION_WHATSAPP =
  "https://wa.me/51987654321?text=" +
  encodeURIComponent("Hola asesor de Fibee, quisiera cotizar un Plan Institución personalizado para ALIS.");

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

function SettingsView({ teacher, studentsCount, activePlan, onPlanChange }) {
  const selected = planById(activePlan);
  const usage = selected.students
    ? Math.min(100, Math.round((studentsCount / selected.students) * 100))
    : 0;

  const activate = (plan) => {
    if (plan.id === "institucion") {
      window.open(ALIS_INSTITUTION_WHATSAPP, "_blank", "noopener,noreferrer");
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

function ProfileConfigModal({ teacher, studentsCount, activePlan, onPlanChange, onProfileChange, onClose }) {
  const [tab, setTab] = React.useState("membresia");
  const [profile, setProfile] = React.useState({
    name: teacher.name || "",
    institution: teacher.institution || "",
    role: teacher.role || "Docente",
    mainArea: teacher.mainArea || "Matemática",
    educationLevel: teacher.educationLevel || "Primaria",
  });
  const [profileSaved, setProfileSaved] = React.useState(false);
  const selected = planById(activePlan);
  const usage = selected.students
    ? Math.min(100, Math.round((studentsCount / selected.students) * 100))
    : 0;

  const selectPlan = (plan) => {
    if (plan.id === "institucion") {
      window.open(ALIS_INSTITUTION_WHATSAPP, "_blank", "noopener,noreferrer");
      return;
    }
    if (plan.id === activePlan) return;
    if (!confirm(`¿Cambiar al Plan ${plan.name} por S/ ${plan.price} al mes?`)) return;
    onPlanChange(plan.id);
  };

  const updateProfile = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setProfileSaved(false);
  };

  const saveProfile = (event) => {
    event.preventDefault();
    onProfileChange(profile);
    setProfileSaved(true);
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
            <form className="profile-tab profile-form-layout" onSubmit={saveProfile}>
              <div className="profile-form-column">
                <section className="profile-form-card">
                  <div className="profile-form-card-title">
                    <Icon name="students" size={18} />
                    <h3>Perfil del docente</h3>
                    <span>Plan: {selected.name}</span>
                  </div>
                  <label className="profile-field">
                    <span>Nombre y apellido</span>
                    <input
                      value={profile.name}
                      onChange={(event) => updateProfile("name", event.target.value)}
                      placeholder="Tu nombre completo"
                      required
                    />
                  </label>
                  <label className="profile-field">
                    <span>Correo de la cuenta</span>
                    <input value={teacher.email || "Cuenta vinculada con Google"} disabled />
                  </label>
                </section>

                <section className="profile-form-card">
                  <div className="profile-form-card-title">
                    <Icon name="book" size={18} />
                    <h3>Información pedagógica</h3>
                  </div>
                  <label className="profile-field">
                    <span>Institución educativa</span>
                    <input
                      value={profile.institution}
                      onChange={(event) => updateProfile("institution", event.target.value)}
                      placeholder="Nombre de la institución (opcional)"
                    />
                  </label>
                  <div className="profile-field-row">
                    <label className="profile-field">
                      <span>Rol</span>
                      <select value={profile.role} onChange={(event) => updateProfile("role", event.target.value)}>
                        <option>Docente</option>
                        <option>Tutor</option>
                        <option>Coordinador pedagógico</option>
                        <option>Director</option>
                      </select>
                    </label>
                    <label className="profile-field">
                      <span>Nivel educativo</span>
                      <select value={profile.educationLevel} onChange={(event) => updateProfile("educationLevel", event.target.value)}>
                        <option>Primaria</option>
                        <option>Secundaria</option>
                        <option>Primaria y secundaria</option>
                      </select>
                    </label>
                  </div>
                  <label className="profile-field">
                    <span>Área principal</span>
                    <select value={profile.mainArea} onChange={(event) => updateProfile("mainArea", event.target.value)}>
                      <option>Matemática</option>
                      <option>Comunicación</option>
                      <option>Inglés</option>
                      <option>Varias áreas</option>
                    </select>
                  </label>
                </section>

                <button className="profile-save-button" type="submit">
                  <Icon name={profileSaved ? "check" : "save"} size={15} />
                  {profileSaved ? "Configuración guardada" : "Guardar configuración"}
                </button>
              </div>

              <aside className="profile-account-column">
                <section className="profile-form-card">
                  <p className="settings-eyebrow">Cuenta en uso</p>
                  <div className="profile-account-plan">
                    <div>
                      <strong>Plan {selected.name}</strong>
                      <span>{selected.price ? `S/. ${selected.price} al mes` : "Plan personalizado"}</span>
                    </div>
                    <span className="profile-active-chip">Activo</span>
                  </div>
                  <button type="button" className="profile-upgrade-link" onClick={() => setTab("membresia")}>
                    Ver o cambiar plan
                  </button>
                </section>

                <section className="profile-form-card">
                  <div className="profile-form-card-title">
                    <Icon name="target" size={18} />
                    <h3>Resumen de ALIS</h3>
                  </div>
                  <div className="profile-summary-row">
                    <span>Alumnos activos</span>
                    <strong>{studentsCount} / {selected.students || "∞"}</strong>
                  </div>
                  <div className="profile-summary-row">
                    <span>Currículo</span>
                    <strong>MINEDU · CNEB</strong>
                  </div>
                  <div className="profile-summary-row">
                    <span>Área principal</span>
                    <strong>{profile.mainArea}</strong>
                  </div>
                </section>

              </aside>
            </form>
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
                        <p className={"profile-plan-picked" + (plan.recommended ? "" : " is-placeholder")}>
                          ★ EL MÁS ELEGIDO
                        </p>
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
