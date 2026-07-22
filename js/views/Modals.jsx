// Modals.jsx — Upload result + Generate material (AI), subject-aware
const { useState } = React;

function Modal({ title, sub, icon, onClose, children, wide }) {
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className={"modal" + (wide ? " modal--wide" : "")} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-head-icon"><Icon name={icon} size={20} /></span>
          <div className="modal-head-txt"><h2>{title}</h2><p>{sub}</p></div>
          <button className="modal-x" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StudentPicker({ value, onChange, students }) {
  return (
    <div className="picker">
      {students.map((s) => (
        <button key={s.id} className={"picker-opt" + (value === s.id ? " is-on" : "")} onClick={() => onChange(s.id)}>
          <Avatar student={s} size={30} />
          <span className="picker-name">{s.name.split(" ")[0]}</span>
          {value === s.id && <span className="picker-check"><Icon name="check" size={14} /></span>}
        </button>
      ))}
    </div>
  );
}

// Popup inicial: siempre elegir alumno antes de Ruta o Subir/Generar
function PickStudentModal({ title, sub, icon, students, onPick, onClose }) {
  const [studentId, setStudentId] = useState(students[0] ? students[0].id : null);
  const canContinue = studentId && students.some((s) => s.id === studentId);

  return (
    <Modal icon={icon || "students"} title={title} sub={sub} onClose={onClose}>
      <div className="modal-body">
        <label className="field-label">Alumno</label>
        {students.length ? (
          <StudentPicker value={studentId} onChange={setStudentId} students={students} />
        ) : (
          <p className="sugg-empty">No hay alumnos en esta materia.</p>
        )}
      </div>
      <div className="modal-foot">
        <button className="btn btn--ghost" onClick={onClose}>Cancelar</button>
        <button
          className="btn btn--primary"
          disabled={!canContinue}
          onClick={() => onPick(byId(studentId))}
        >
          Continuar
        </button>
      </div>
    </Modal>
  );
}

// ---------- Upload result ----------
function UploadModal({ preset, students, teacherId, onClose, onUploaded, onGenerateReinforcement }) {
  const [studentId, setStudentId] = useState(preset ? preset.id : (students[0] && students[0].id));
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState("form"); // form | uploading | done
  const [analysis, setAnalysis] = useState(null);
  const [pathOutcome, setPathOutcome] = useState(null);
  const [error, setError] = useState("");
  const fileRef = React.useRef(null);
  const student = byId(studentId) || students.find((s) => s.id === studentId);

  const pickFile = (f) => {
    if (!f) return;
    const ok = /^(image\/|application\/pdf)/.test(f.type) || /\.(jpe?g|png|webp|pdf)$/i.test(f.name);
    if (!ok) {
      setError("Solo fotos (JPG/PNG) o PDF.");
      return;
    }
    setError("");
    setFile(f);
  };

  const analyze = async () => {
    if (!file || !student) return;
    setError("");
    setStage("uploading");
    try {
      const result = await uploadEvidence({ teacherId, student, file });
      setAnalysis(result.analysis);
      setPathOutcome(result.pathOutcome || null);
      setStage("done");
      onUploaded?.(result);
    } catch (err) {
      setError(err.message || "No se pudo subir la evidencia.");
      setStage("form");
    }
  };

  if (!student) {
    return (
      <Modal icon="upload" title="Subir resultado" sub="No hay alumnos en esta materia." onClose={onClose}>
        <div className="modal-body"><p className="sugg-empty">Agrega un alumno primero.</p></div>
        <div className="modal-foot"><button className="btn btn--ghost" onClick={onClose}>Cerrar</button></div>
      </Modal>
    );
  }

  return (
    <Modal icon="upload" title="Subir resultado" sub="Foto o PDF desde web o celular. Se guarda y se compara con el CNEB." onClose={onClose}>
      <div className="modal-body">
        {stage !== "done" && (
          <>
            <label className="field-label">Alumno · {student.subject}</label>
            <StudentPicker value={studentId} onChange={(id) => { setStudentId(id); setFile(null); }} students={students} />

            <label className="field-label">Archivo del resultado</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf,.pdf"
              capture="environment"
              hidden
              onChange={(e) => pickFile(e.target.files && e.target.files[0])}
            />
            <button
              type="button"
              className={"dropzone" + (file ? " has-file" : "")}
              onClick={() => fileRef.current && fileRef.current.click()}
              disabled={stage === "uploading"}
            >
              {file ? (
                <div className="dropzone-file">
                  <span className="dropzone-thumb"><Icon name={file.type === "application/pdf" ? "file" : "image"} size={22} /></span>
                  <span className="dropzone-file-meta">
                    <strong>{file.name}</strong>
                    <em>{(file.size / 1024).toFixed(0)} KB · listo para subir</em>
                  </span>
                  <span className="dropzone-ok"><Icon name="check" size={16} /></span>
                </div>
              ) : (
                <div className="dropzone-empty">
                  <span className="dropzone-icon"><Icon name="image" size={26} /></span>
                  <strong>Toca para elegir foto o PDF</strong>
                  <em>En el celular puedes usar la cámara · JPG, PNG, PDF</em>
                </div>
              )}
            </button>

            {error && <p className="login-error" style={{ marginTop: 8 }}>{error}</p>}
            {stage === "uploading" && (
              <div className="analyzing"><span className="spinner" />Subiendo y analizando con GPT Mini (Alis)…</div>
            )}
          </>
        )}

        {stage === "done" && analysis && (
          <div className="result">
            <div className="result-banner">
              <span className="result-score" style={{ fontSize: 16, fontWeight: 700 }}>CNEB</span>
              <div className="result-banner-txt">
                <strong>Evidencia guardada</strong>
                <span>{analysis.topicTitle} · {student.name}</span>
              </div>
              <StatusChip status={analysis.status} />
            </div>
            {analysis.cnebCompetence && (
              <div className="result-next" style={{ marginBottom: 8 }}>
                <span><strong>Competencia:</strong> {analysis.cnebCompetence}</span>
              </div>
            )}

            <div className="result-block">
              <p className="result-h">1. Figura / material visto</p>
              <p className="result-text">{analysis.graphicDescription || "Sin descripción visual."}</p>
              {(analysis.graphicElements || []).length > 0 && (
                <ul className="result-elements">
                  {analysis.graphicElements.map((el, i) => <li key={i}>{el}</li>)}
                </ul>
              )}
            </div>

            <div className="result-block">
              <p className="result-h">2. Objetivo del ejercicio</p>
              <p className="result-text">{analysis.exerciseGoal || "Sin objetivo identificado."}</p>
            </div>

            <div className="result-block">
              <p className="result-h">3. Diagnóstico del alumno</p>
              {analysis.studentDiagnosis?.summary && (
                <p className="result-text">{analysis.studentDiagnosis.summary}</p>
              )}
              <ul className="result-list">
                {(analysis.studentDiagnosis?.strengths || []).map((t, i) => (
                  <li key={"ok-" + i}><Icon name="check" size={15} style={{ color: "var(--good)" }} /> {t}</li>
                ))}
                {(analysis.studentDiagnosis?.errors || []).map((t, i) => (
                  <li key={"err-" + i}><Icon name="alert" size={15} style={{ color: "var(--risk)" }} /> {t}</li>
                ))}
                {!(analysis.studentDiagnosis?.strengths || []).length && !(analysis.studentDiagnosis?.errors || []).length &&
                  (analysis.obs || []).map((o, i) => (
                    <li key={i}><Icon name={o.ok ? "check" : "alert"} size={15} style={{ color: o.ok ? "var(--good)" : "var(--risk)" }} /> {o.t}</li>
                  ))}
              </ul>
            </div>

            <div className="result-next"><span>Siguiente: {analysis.next}</span></div>
            {pathOutcome?.message && (
              <div className={"result-path" + (pathOutcome.passed ? " is-pass" : " is-retake")}>
                <strong>{pathOutcome.passed ? "Ruta: avanzó / aprobó" : "Ruta: retoma"}</strong>
                <span>{pathOutcome.message}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="modal-foot">
        {stage === "done" ? (
          <>
            <button className="btn btn--ghost" onClick={onClose}>Cerrar</button>
            <button
              className="btn btn--primary"
              onClick={() => {
                if (onGenerateReinforcement) onGenerateReinforcement(student, analysis);
                else onClose();
              }}
            >
              <Icon name="sparkles" size={16} /> Generar refuerzo
            </button>
          </>
        ) : (
          <>
            <button className="btn btn--ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn--primary" disabled={!file || stage === "uploading"} onClick={analyze}>
              <Icon name="sparkles" size={16} /> {stage === "uploading" ? "Analizando…" : "Subir y analizar con IA"}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

// ---------- Generate material ----------
function GenerateModal({ preset, students, analysis, onClose }) {
  const list = students || [];
  const [studentId, setStudentId] = useState(preset && preset.id ? preset.id : (list[0] && list[0].id));
  const [type, setType] = useState("practica");
  const [difficulty, setDifficulty] = useState("graduada");
  const [count, setCount] = useState(8);
  const [stage, setStage] = useState("form"); // form | generating | done
  const [material, setMaterial] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const student = byId(studentId) || list.find((s) => s.id === studentId);

  if (!student) {
    return (
      <Modal icon="sparkles" title="Generar material con Alis" sub="Necesitas un alumno primero." onClose={onClose}>
        <div className="modal-body"><p className="sugg-empty">Agrega un alumno para generar material.</p></div>
        <div className="modal-foot"><button className="btn btn--ghost" onClick={onClose}>Cerrar</button></div>
      </Modal>
    );
  }

  const types = [{ id: "practica", label: "Práctica", icon: "pencil" }, { id: "quiz", label: "Quiz", icon: "check" }, { id: "reto", label: "Reto", icon: "flag" }];
  const diffs = [{ id: "facil", label: "Fácil" }, { id: "graduada", label: "Graduada" }, { id: "avanzada", label: "Avanzada" }];
  const typeLabel = { practica: "Práctica", quiz: "Quiz", reto: "Reto" }[type];
  const topicHint = analysis?.topicTitle || analysis?.next || student.focus || "Tema del alumno";

  const generate = async () => {
    setError("");
    setStage("generating");
    try {
      const mat = await generateMaterial({
        student,
        type,
        difficulty,
        count,
        analysis: analysis || null,
      });
      setMaterial(mat);
      setStage("done");
    } catch (err) {
      setError(err.message || "No se pudo generar el material.");
      setStage("form");
    }
  };

  const download = () => {
    if (!material) return;
    setError("");
    setDownloading(true);
    try {
      downloadMaterialPdf(material, student);
    } catch (err) {
      setError(err.message || "No se pudo descargar el PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const exercises = material?.exercises || [];
  const preview = exercises.slice(0, 8);

  return (
    <Modal
      icon="sparkles"
      title="Generar material con Alis"
      sub="Ejercicios reales con IA, alineados al alumno y al CNEB. Descarga el PDF cuando esté listo."
      onClose={onClose}
      wide
    >
      <div className="modal-body modal-body--gen">
        {stage !== "done" ? (
          <>
            <label className="field-label">Para quién · {student.subject}</label>
            <StudentPicker value={studentId} onChange={(id) => { setStudentId(id); setError(""); }} students={list} />

            <div className="gen-grid">
              <div>
                <label className="field-label">Tipo de material</label>
                <div className="seg seg--full">
                  {types.map((tp) => (
                    <button key={tp.id} type="button" className={"seg-btn" + (type === tp.id ? " is-on" : "")} onClick={() => setType(tp.id)} disabled={stage === "generating"}>
                      <Icon name={tp.icon} size={15} /> {tp.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="field-label">Dificultad</label>
                <div className="seg seg--full">
                  {diffs.map((d) => (
                    <button key={d.id} type="button" className={"seg-btn" + (difficulty === d.id ? " is-on" : "")} onClick={() => setDifficulty(d.id)} disabled={stage === "generating"}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <label className="field-label">Tema (según alumno / análisis)</label>
            <div className="topic-pills">
              <span className="topic-pill is-on">{topicHint}<Icon name="check" size={13} /></span>
            </div>

            <label className="field-label">Cantidad de ejercicios · {count}</label>
            <input className="range" type="range" min="4" max="16" value={count} onChange={(e) => setCount(+e.target.value)} disabled={stage === "generating"} />

            {error && <p className="login-error" style={{ marginTop: 8 }}>{error}</p>}
            {stage === "generating" && (
              <div className="analyzing"><span className="spinner" />Alis está creando {count} ejercicios de {typeLabel.toLowerCase()} para {student.name.split(" ")[0]}…</div>
            )}
          </>
        ) : (
          <div className="gen-result">
            <div className="gen-result-head">
              <div>
                <p className="gen-result-title">{typeLabel} · {material?.topic || topicHint}</p>
                <p className="gen-result-sub">{exercises.length} ejercicios · dificultad {difficulty} · {student.name}</p>
              </div>
              <span className="minedu-tag"><Icon name="check" size={13} /> Alineado MINEDU</span>
            </div>
            <div className="gen-preview">
              {preview.map((ex, i) => (
                <div className="gen-ex" key={i}>
                  <span className="gen-ex-n">{ex.n || i + 1}</span>
                  <span className="gen-ex-q">{ex.prompt}</span>
                </div>
              ))}
              {exercises.length > preview.length && (
                <div className="gen-more">+ {exercises.length - preview.length} ejercicios más en el PDF…</div>
              )}
            </div>
            {material?.teacherNotes && (
              <div className="result-next" style={{ marginTop: 10 }}>
                <span><strong>Nota docente:</strong> {material.teacherNotes}</span>
              </div>
            )}
            {error && <p className="login-error" style={{ marginTop: 8 }}>{error}</p>}
          </div>
        )}
      </div>

      <div className="modal-foot">
        {stage === "done" ? (
          <>
            <button className="btn btn--ghost" type="button" onClick={() => { setStage("form"); setMaterial(null); setError(""); }}>Volver</button>
            <button className="btn btn--ghost" type="button" onClick={download} disabled={downloading}>
              <Icon name="download" size={16} /> {downloading ? "Descargando…" : "Descargar PDF"}
            </button>
            <button className="btn btn--primary" type="button" onClick={onClose}><Icon name="check" size={16} /> Listo</button>
          </>
        ) : (
          <>
            <button className="btn btn--ghost" type="button" onClick={onClose} disabled={stage === "generating"}>Cancelar</button>
            <button className="btn btn--primary" type="button" disabled={stage === "generating"} onClick={generate}>
              <Icon name="sparkles" size={16} /> {stage === "generating" ? "Generando…" : "Generar con Alis"}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

function EditHistoryModal({ student, entry, entryKey, teacherId, onSaved, onDeleted, onClose }) {
  const [label, setLabel] = useState(entry?.label || "");
  const [score, setScore] = useState(entry?.score == null ? "" : String(entry.score));
  const [graphicDescription, setGraphicDescription] = useState(entry?.graphicDescription || "");
  const [exerciseGoal, setExerciseGoal] = useState(entry?.exerciseGoal || "");
  const [diagnosisSummary, setDiagnosisSummary] = useState(entry?.studentDiagnosis?.summary || entry?.summary || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    setLoading(true);
    try {
      const saved = await updateStudentHistoryEntry(student.id, teacherId, entryKey, {
        label,
        score,
        graphicDescription,
        exerciseGoal,
        summary: diagnosisSummary,
        studentDiagnosis: {
          ...(entry?.studentDiagnosis || {}),
          summary: diagnosisSummary,
        },
      });
      onSaved?.(saved);
    } catch (err) {
      setError(err.message || "No se pudo guardar.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!confirm("¿Eliminar este resultado del historial?")) return;
    setLoading(true);
    try {
      const saved = await deleteStudentHistoryEntry(student.id, teacherId, entryKey);
      onDeleted?.(saved);
    } catch (err) {
      setError(err.message || "No se pudo eliminar.");
      setLoading(false);
    }
  };

  return (
    <Modal
      icon="pencil"
      title="Editar resultado"
      sub={entry?.fileName ? `Evidencia · ${entry.fileName}` : "Corrige título, nota y contenido del análisis."}
      onClose={onClose}
    >
      <div className="modal-body">
        <label className="field-label">Título</label>
        <input
          className="form-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ej. Ecuaciones cuadráticas"
          disabled={loading}
        />

        <label className="field-label">Nota (%)</label>
        <input
          className="form-input"
          type="number"
          min="0"
          max="100"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="0–100 (vacío = sin nota)"
          disabled={loading}
        />

        <label className="field-label">1. Figura / material visto</label>
        <textarea
          className="form-input form-textarea"
          rows={3}
          value={graphicDescription}
          onChange={(e) => setGraphicDescription(e.target.value)}
          placeholder="Descripción en texto de la figura o material"
          disabled={loading}
        />

        <label className="field-label">2. Objetivo del ejercicio</label>
        <textarea
          className="form-input form-textarea"
          rows={2}
          value={exerciseGoal}
          onChange={(e) => setExerciseGoal(e.target.value)}
          placeholder="Qué pedía el ejercicio"
          disabled={loading}
        />

        <label className="field-label">3. Diagnóstico del alumno</label>
        <textarea
          className="form-input form-textarea"
          rows={3}
          value={diagnosisSummary}
          onChange={(e) => setDiagnosisSummary(e.target.value)}
          placeholder="Resumen de aciertos y errores"
          disabled={loading}
        />

        {error && <p className="login-error" style={{ marginTop: 8 }}>{error}</p>}
      </div>
      <div className="modal-foot">
        <button className="btn btn--ghost" style={{ marginRight: "auto", color: "var(--risk-ink)" }} onClick={remove} disabled={loading}>
          Eliminar
        </button>
        <button className="btn btn--ghost" onClick={onClose} disabled={loading}>Cancelar</button>
        <button className="btn btn--primary" onClick={save} disabled={loading || !label.trim()}>
          {loading ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </Modal>
  );
}

function StudentFormModal({ student, defaultSubjectId, defaultCompetenceId: defaultCompProp, teacherId, onSaved, onDeleted, onClose }) {
  const editing = !!(student && student.id);
  const initialSubject = student?.subjectId || defaultSubjectId || "mate";
  const initialComp = student?.competenceId
    || defaultCompProp
    || (typeof defaultCompetenceId === "function" ? defaultCompetenceId(initialSubject) : "c23");
  const [name, setName] = useState(student?.name || "");
  const [grade, setGrade] = useState(student?.grade || "");
  const [subjectId, setSubjectId] = useState(initialSubject);
  const [competenceId, setCompetenceId] = useState(initialComp);
  const [focus, setFocus] = useState(student?.focus || "");
  const [note, setNote] = useState(student?.note || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const comps = typeof competenciesOf === "function" ? competenciesOf(subjectId) : [];

  const changeSubject = (sid) => {
    setSubjectId(sid);
    const next = typeof defaultCompetenceId === "function" ? defaultCompetenceId(sid) : null;
    setCompetenceId(next);
  };

  const save = async () => {
    setError("");
    setLoading(true);
    try {
      const payload = { name, grade: grade || null, subjectId, competenceId, focus, note };
      const saved = editing
        ? await updateStudent(student.id, payload, teacherId)
        : await createStudent(payload, teacherId);
      onSaved(saved);
    } catch (err) {
      setError(err.message || "No se pudo guardar.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!editing) return;
    if (!confirm("¿Eliminar a " + student.name + "? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    try {
      await deleteStudent(student.id, teacherId);
      onDeleted?.(student.id);
    } catch (err) {
      setError(err.message || "No se pudo eliminar.");
      setLoading(false);
    }
  };

  return (
    <Modal
      icon="students"
      title={editing ? "Editar alumno" : "Agregar alumno"}
      sub="El alumno se organiza por competencia MINEDU (CNEB)."
      onClose={onClose}
    >
      <div className="modal-body">
        <label className="field-label">Nombre completo</label>
        <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Ana Flores" disabled={loading} />

        <label className="field-label">Área curricular</label>
        <div className="comp-pick comp-pick--areas">
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={"comp-pick-btn" + (subjectId === s.id ? " is-on" : "")}
              onClick={() => changeSubject(s.id)}
              disabled={loading}
            >
              <span className="comp-pick-icon"><Icon name={s.icon} size={16} /></span>
              <span className="comp-pick-txt">
                <span className="comp-pick-name">{s.name}</span>
                <span className="comp-pick-meta">{s.short}</span>
              </span>
            </button>
          ))}
        </div>

        <label className="field-label">Competencia MINEDU</label>
        <div className="comp-pick">
          {comps.map((c) => (
            <button
              key={c.id}
              type="button"
              className={"comp-pick-btn" + (competenceId === c.id ? " is-on" : "")}
              onClick={() => setCompetenceId(c.id)}
              disabled={loading}
            >
              <span className="comp-pick-code">C{c.code}</span>
              <span className="comp-pick-txt">
                <span className="comp-pick-name">{c.short}</span>
                <span className="comp-pick-meta">{c.competence}</span>
              </span>
            </button>
          ))}
        </div>

        <label className="field-label">Grado (opcional)</label>
        <div className="seg seg--full">
          {[
            { id: "", label: "Sin grado" },
            { id: "1° Secundaria", label: "1° Sec." },
            { id: "2° Secundaria", label: "2° Sec." },
            { id: "3° Secundaria", label: "3° Sec." },
          ].map((g) => (
            <button key={g.id || "none"} type="button" className={"seg-btn" + (grade === g.id ? " is-on" : "")} onClick={() => setGrade(g.id)} disabled={loading}>{g.label}</button>
          ))}
        </div>

        <label className="field-label">Enfoque actual (opcional)</label>
        <input className="form-input" value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Ej. Fracciones heterogéneas" disabled={loading} />

        <label className="field-label">Nota (opcional)</label>
        <textarea className="form-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Observaciones del docente…" rows={3} disabled={loading} />

        {error && <p className="login-error" style={{ marginTop: 8 }}>{error}</p>}
      </div>
      <div className="modal-foot">
        {editing && (
          <button className="btn btn--ghost" style={{ marginRight: "auto", color: "var(--risk-ink)" }} onClick={remove} disabled={loading}>
            Eliminar
          </button>
        )}
        <button className="btn btn--ghost" onClick={onClose} disabled={loading}>Cancelar</button>
        <button className="btn btn--primary" onClick={save} disabled={loading || !name.trim() || !competenceId}>
          {loading ? "Guardando…" : editing ? "Guardar cambios" : "Agregar alumno"}
        </button>
      </div>
    </Modal>
  );
}

Object.assign(window, { UploadModal, GenerateModal, PickStudentModal, StudentFormModal, EditHistoryModal });
