// RutaPedagogica.jsx — nivel actual → objetivo CNEB + línea de tiempo de sesiones
function RutaPedagogicaView({ student, teacherId, onBack, onGenerate, onPathUpdated }) {
  const [passDraft, setPassDraft] = React.useState(null);
  const [savingPass, setSavingPass] = React.useState(false);
  const [dlError, setDlError] = React.useState("");

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
  const passScore = path?.passScore || (typeof LEARNING_PATH_PASS_SCORE === "number" ? LEARNING_PATH_PASS_SCORE : 70);
  const currentSession = sessions.find((s) => s.status === "current");
  const doneCount = sessions.filter((s) => s.status === "done").length;
  const practices = [
    ...(currentSession?.expectedPractice ? [{ ...currentSession.expectedPractice, active: true }] : []),
    ...((currentSession?.generatedPractices || []).filter((p) => !currentSession?.expectedPractice || p.code !== currentSession.expectedPractice.code)),
  ].slice(0, 6);

  const kindLabel = (kind) =>
    kind === "diagnostico" ? "Diagnóstico" :
    kind === "meta" ? "Meta" : "Puente";

  const statusLabel = (s) => {
    if (s.status === "done") return "Aprobada";
    if (s.status === "current" && s.lastResult === "retoma") return "Retoma";
    if (s.status === "current") return "En curso";
    return "Pendiente";
  };

  const savePass = async () => {
    if (!path) {
      setDlError("Primero crea la ruta subiendo un diagnóstico o evidencia.");
      return;
    }
    if (typeof updateLearningPathPassScore !== "function") return;
    setSavingPass(true);
    setDlError("");
    try {
      await updateLearningPathPassScore(student.id, teacherId, passDraft == null ? passScore : passDraft);
      setPassDraft(null);
      onPathUpdated?.();
    } catch (err) {
      setDlError(err.message || "No se pudo guardar la nota mínima.");
    } finally {
      setSavingPass(false);
    }
  };

  const redownload = (item) => {
    setDlError("");
    try {
      if (typeof downloadMaterialPdf !== "function") throw new Error("Descarga no disponible.");
      let full = item;
      if (typeof findGeneratedPractice === "function" && item?.code) {
        const hit = findGeneratedPractice(student, item.code);
        if (hit?.practice) full = { ...item, ...hit.practice };
      } else if (!(item.exercises || []).length && currentSession?.generatedPractices?.length) {
        const hit = currentSession.generatedPractices.find(
          (p) => String(p.code || "").toUpperCase() === String(item.code || "").toUpperCase()
        );
        if (hit) full = { ...item, ...hit };
      }
      const exercises = full.exercises || (full.samplePrompts || []).map((p, i) => ({ n: i + 1, prompt: p }));
      if (!exercises.length) {
        throw new Error("No hay ejercicios guardados de esta práctica. Genera una nueva y descárgala de nuevo.");
      }
      downloadMaterialPdf({
        title: full.title,
        topic: full.topic || full.title,
        type: full.type || "practica",
        difficulty: full.difficulty || "graduada",
        exercises,
        teacherNotes: full.teacherNotes || "",
        practiceCode: full.code,
      }, student);
    } catch (err) {
      setDlError(err.message || "No se pudo descargar.");
    }
  };

  return (
    <div className="view">
      <header className="topbar">
        <div className="topbar-l topbar-l--profile">
          <button className="back-btn" onClick={onBack}>
            <Icon name="arrowLeft" size={18} /> Alumnos
          </button>
        </div>
        <div className="topbar-r topbar-r--actions">
          <button
            className="btn btn--primary"
            onClick={() => onGenerate(student, currentSession ? {
              sessionId: currentSession.id,
              topicTitle: currentSession.title,
              next: currentSession.why,
              summary: `Sesión ${currentSession.order}: ${currentSession.title}. ${currentSession.why}${currentSession.lastResult === "retoma" ? " Retoma del mismo nivel, no idéntica." : ""}`,
            } : null)}
          >
            <Icon name="sparkles" size={18} /> <span className="btn-txt">Generar práctica</span>
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

        <section className="ruta-progress-banner">
          <div>
            <p className="settings-eyebrow">Control de avance</p>
            <strong>
              {!path
                ? "Sin ruta todavía"
                : (currentSession
                  ? `Sesión en curso: ${currentSession.title}`
                  : (doneCount === sessions.length && sessions.length ? "Ruta completada" : "Sin sesión activa"))}
            </strong>
            <p>
              {!path
                ? "Sube un diagnóstico o evidencia del alumno para que Alis construya su línea de sesiones."
                : "Sube la práctica ALIS de la sesión actual (con código visible) para aprobar o retomar."}
            </p>
            {path ? (
              <div className="pass-edit">
                <label>Nota mínima</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={passDraft == null ? passScore : passDraft}
                  onChange={(e) => setPassDraft(Number(e.target.value))}
                />
                <button type="button" className="btn btn--ghost btn--sm" disabled={savingPass} onClick={savePass}>
                  {savingPass ? "Guardando…" : "Guardar"}
                </button>
              </div>
            ) : null}
          </div>
          <div className="ruta-progress-stats">
            {path ? (
              <>
                <span>{doneCount}/{sessions.length || 0} hechas</span>
                {currentSession?.attempts ? <span>{currentSession.attempts} intento(s)</span> : null}
                {currentSession?.lastScore != null ? <span>Última nota: {currentSession.lastScore}%</span> : null}
                {currentSession?.expectedPractice?.code ? <span>Código activo: {currentSession.expectedPractice.code}</span> : <span>Sin práctica ALIS activa</span>}
              </>
            ) : (
              <span>0 sesiones · ruta no creada</span>
            )}
          </div>
        </section>

        {practices.length ? (
          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Prácticas ALIS de la sesión</h2>
            </div>
            <div className="practice-list">
              {practices.map((p, i) => (
                <div className="practice-row" key={(p.code || "p") + i}>
                  <div>
                    <strong>{p.code || "Sin código"}</strong>
                    <span>{p.topic || p.title || "Práctica"}{p.active ? " · vigente" : ""}{p.reason === "retoma" ? " · invalidada" : ""}</span>
                  </div>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => redownload(p)}>
                    <Icon name="download" size={15} /> Re-descargar
                  </button>
                </div>
              ))}
            </div>
            {dlError ? <p className="login-error" style={{ padding: "0 16px 12px" }}>{dlError}</p> : null}
          </section>
        ) : null}

        <section className="ruta-flow">
          <div className="ruta-node">
            <span className="ruta-node-label">Nivel actual</span>
            <p className="ruta-node-title">{currentSession?.title || student.focus || "Por definir"}</p>
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
                ~{path.estimate} {path.estimate === 1 ? "sesión" : "sesiones"} · mínimo {passScore}
              </span>
            ) : null}
          </div>

          <p className="ruta-timeline-lead">
            {path
              ? `Del más básico al objetivo. Cada evidencia de la práctica ALIS (≥${passScore}) aprueba o retoma la sesión en curso.`
              : "Cuando subas la primera evidencia, Alis creará aquí el diagnóstico y las sesiones puente hasta la meta."}
          </p>

          <div className="ruta-timeline">
            {sessions.length ? sessions.map((s, i) => (
              <div
                key={s.id || i}
                className={
                  "ruta-step" +
                  (s.status === "done" ? " is-done" : "") +
                  (s.status === "current" ? " is-current" : "") +
                  (s.lastResult === "retoma" && s.status === "current" ? " is-retake" : "") +
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
                    <span className="ruta-step-status">{statusLabel(s)}</span>
                  </div>
                  <p className="ruta-step-title">{s.title}</p>
                  <p className="ruta-step-why">{s.why}</p>
                  {(s.attempts > 0 || s.lastScore != null) && (
                    <p className="ruta-step-meta">
                      {s.attempts ? `${s.attempts} intento(s)` : "Sin intentos"}
                      {s.lastScore != null ? ` · última nota ${s.lastScore}%` : ""}
                      {s.lastResult === "retoma" ? " · necesita retoma" : ""}
                      {s.lastResult === "aprobada" && s.status === "done" ? " · aprobada" : ""}
                    </p>
                  )}
                  {s.status === "current" ? (
                    <div className="ruta-step-actions">
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={() => onGenerate(student, {
                          sessionId: s.id,
                          topicTitle: s.title,
                          next: s.why,
                          summary: `Sesión ${s.order}: ${s.title}. ${s.why}${s.lastResult === "retoma" ? " Retoma del mismo nivel, no idéntica." : ""}`,
                        })}
                      >
                        {s.lastResult === "retoma" ? "Generar retoma" : "Generar práctica"} <Icon name="arrowUpRight" size={15} />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )) : (
              <div className="sugg-empty" style={{ margin: "8px 0 4px" }}>
                <Icon name="target" size={18} /> Sin sesiones aún. Sube un resultado del alumno para iniciar la ruta.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

Object.assign(window, { RutaPedagogicaView });
