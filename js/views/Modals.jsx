// Modals.jsx — Upload result + Generate material (AI), subject-aware
const { useState } = React;

const SUBJECT_CONTENT = {
  mate: {
    file: "practica_fracciones.jpg", topicTitle: "Fracciones heterogéneas",
    pills: ["Fracciones heterogéneas", "m.c.m. y m.c.d.", "Simplificación"],
    score: 68, status: "atencion",
    obs: [
      { ok: true, t: "Domina la suma de fracciones homogéneas (4/4 correctas)." },
      { ok: false, t: "Confunde el m.c.m. al sumar fracciones heterogéneas." },
      { ok: false, t: "Errores de simplificación en 3 de 6 ejercicios." },
    ],
    next: "generar 8 ejercicios graduados de fracciones heterogéneas.",
    preview: ["Resuelve: 1/2 + 1/3 =", "Resuelve: 3/4 − 1/6 =", "Halla el m.c.m. de 4 y 6, luego suma 1/4 + 5/6.", "Simplifica el resultado: 8/12 + 2/12 ="],
  },
  ingles: {
    file: "listening_unit4.pdf", topicTitle: "Past simple — regular verbs",
    pills: ["Past simple", "Vocabulario: rutinas", "Listening"],
    score: 72, status: "normal",
    obs: [
      { ok: true, t: "Buena comprensión auditiva (8/10 correctas)." },
      { ok: false, t: "Confunde verbos regulares e irregulares en pasado." },
      { ok: false, t: "Errores de spelling en 3 respuestas." },
    ],
    next: "generar 8 ejercicios de past simple con verbos regulares.",
    preview: ["Complete: Yesterday I ____ (play) football.", "Write the past form of: study, watch, travel.", "Listen and answer: What did Ana do on Sunday?", "Order the words: school / to / went / she."],
  },
  comunicacion: {
    file: "texto_narrativo.jpg", topicTitle: "Textos narrativos",
    pills: ["Estructura narrativa", "Conectores", "Ortografía"],
    score: 58, status: "atencion",
    obs: [
      { ok: true, t: "Buen uso de vocabulario descriptivo." },
      { ok: false, t: "La estructura del texto no es clara (falta desenlace)." },
      { ok: false, t: "Errores de ortografía en 4 oraciones." },
    ],
    next: "generar una guía paso a paso de textos narrativos.",
    preview: ["Identifica inicio, nudo y desenlace en el texto dado.", "Redacta un párrafo narrativo usando 3 conectores.", "Corrige los errores de ortografía en las oraciones.", "Ordena los hechos del relato cronológicamente."],
  },
};

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
function UploadModal({ preset, students, teacherId, onClose, onUploaded }) {
  const [studentId, setStudentId] = useState(preset ? preset.id : (students[0] && students[0].id));
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState("form"); // form | uploading | done
  const [analysis, setAnalysis] = useState(null);
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
              <div className="analyzing"><span className="spinner" />Subiendo y analizando con Claude (Alis)…</div>
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
              <p className="result-h"><span className="ai-badge ai-badge--sm"><Icon name="sparkles" size={13} /></span> Lectura de Alis</p>
              <ul className="result-list">
                {analysis.obs.map((o, i) => (
                  <li key={i}><Icon name={o.ok ? "check" : "alert"} size={15} style={{ color: o.ok ? "var(--good)" : "var(--risk)" }} /> {o.t}</li>
                ))}
              </ul>
            </div>
            <div className="result-next"><span>Siguiente: {analysis.next}</span></div>
          </div>
        )}
      </div>

      <div className="modal-foot">
        {stage === "done" ? (
          <>
            <button className="btn btn--ghost" onClick={onClose}>Cerrar</button>
            <button className="btn btn--primary" onClick={onClose}><Icon name="sparkles" size={16} /> Generar refuerzo</button>
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
function GenerateModal({ preset, students, onClose }) {
  const [studentId, setStudentId] = useState(preset && preset.id ? preset.id : students[0].id);
  const [type, setType] = useState("practica");
  const [difficulty, setDifficulty] = useState("graduada");
  const [count, setCount] = useState(8);
  const [stage, setStage] = useState("form");
  const student = byId(studentId);
  const c = SUBJECT_CONTENT[student.subjectId];

  const types = [{ id: "practica", label: "Práctica", icon: "pencil" }, { id: "quiz", label: "Quiz", icon: "check" }, { id: "reto", label: "Reto", icon: "flag" }];
  const diffs = [{ id: "facil", label: "Fácil" }, { id: "graduada", label: "Graduada" }, { id: "avanzada", label: "Avanzada" }];
  const typeLabel = { practica: "Práctica", quiz: "Quiz", reto: "Reto" }[type];

  const generate = () => { setStage("generating"); setTimeout(() => setStage("done"), 2000); };

  return (
    <Modal icon="sparkles" title="Generar material con Alis" sub="Alineado al currículo MINEDU y al nivel del alumno." onClose={onClose} wide>
      <div className="modal-body modal-body--gen">
        {stage !== "done" ? (
          <>
            <label className="field-label">Para quién · {student.subject}</label>
            <StudentPicker value={studentId} onChange={setStudentId} students={students} />

            <div className="gen-grid">
              <div>
                <label className="field-label">Tipo de material</label>
                <div className="seg seg--full">
                  {types.map((tp) => (
                    <button key={tp.id} className={"seg-btn" + (type === tp.id ? " is-on" : "")} onClick={() => setType(tp.id)}><Icon name={tp.icon} size={15} /> {tp.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="field-label">Dificultad</label>
                <div className="seg seg--full">
                  {diffs.map((d) => (
                    <button key={d.id} className={"seg-btn" + (difficulty === d.id ? " is-on" : "")} onClick={() => setDifficulty(d.id)}>{d.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <label className="field-label">Tema (sugerido por Alis)</label>
            <div className="topic-pills">
              {c.pills.map((p, i) => (
                <span key={p} className={"topic-pill" + (i === 0 ? " is-on" : "")}>{p}{i === 0 && <Icon name="check" size={13} />}</span>
              ))}
              <span className="topic-pill topic-pill--add"><Icon name="plus" size={13} /> Otro</span>
            </div>

            <label className="field-label">Cantidad de ejercicios · {count}</label>
            <input className="range" type="range" min="4" max="16" value={count} onChange={(e) => setCount(+e.target.value)} />

            {stage === "generating" && (
              <div className="analyzing"><span className="spinner" />Alis está creando {count} ejercicios de {typeLabel.toLowerCase()} para {student.name.split(" ")[0]}…</div>
            )}
          </>
        ) : (
          <div className="gen-result">
            <div className="gen-result-head">
              <div>
                <p className="gen-result-title">{typeLabel} · {c.topicTitle}</p>
                <p className="gen-result-sub">{count} ejercicios · dificultad {difficulty} · {student.name}</p>
              </div>
              <span className="minedu-tag"><Icon name="check" size={13} /> Alineado MINEDU</span>
            </div>
            <div className="gen-preview">
              {c.preview.map((q, i) => (
                <div className="gen-ex" key={i}><span className="gen-ex-n">{i + 1}</span><span className="gen-ex-q">{q}</span></div>
              ))}
              <div className="gen-more">+ {Math.max(count - 4, 0)} ejercicios más…</div>
            </div>
          </div>
        )}
      </div>

      <div className="modal-foot">
        {stage === "done" ? (
          <>
            <button className="btn btn--ghost" onClick={onClose}>Descartar</button>
            <button className="btn btn--ghost"><Icon name="download" size={16} /> Descargar PDF</button>
            <button className="btn btn--primary" onClick={onClose}><Icon name="download" size={16} /> Descargar y cerrar</button>
          </>
        ) : (
          <>
            <button className="btn btn--ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn--primary" disabled={stage === "generating"} onClick={generate}><Icon name="sparkles" size={16} /> Generar con Alis</button>
          </>
        )}
      </div>
    </Modal>
  );
}

const GRADES = ["1° Secundaria", "2° Secundaria", "3° Secundaria"];

function StudentFormModal({ student, defaultSubjectId, teacherId, onSaved, onDeleted, onClose }) {
  const editing = !!(student && student.id);
  const [name, setName] = useState(student?.name || "");
  const [grade, setGrade] = useState(student?.grade || "2° Secundaria");
  const [subjectId, setSubjectId] = useState(student?.subjectId || defaultSubjectId || "mate");
  const [focus, setFocus] = useState(student?.focus || "");
  const [note, setNote] = useState(student?.note || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    setLoading(true);
    try {
      const payload = { name, grade, subjectId, focus, note };
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
      sub="Los alumnos quedan vinculados a tu cuenta de docente."
      onClose={onClose}
    >
      <div className="modal-body">
        <label className="field-label">Nombre completo</label>
        <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Ana Flores" disabled={loading} />

        <label className="field-label">Grado</label>
        <div className="seg seg--full">
          {GRADES.map((g) => (
            <button key={g} type="button" className={"seg-btn" + (grade === g ? " is-on" : "")} onClick={() => setGrade(g)} disabled={loading}>{g}</button>
          ))}
        </div>

        <label className="field-label">Materia</label>
        <div className="seg seg--full">
          {SUBJECTS.map((s) => (
            <button key={s.id} type="button" className={"seg-btn" + (subjectId === s.id ? " is-on" : "")} onClick={() => setSubjectId(s.id)} disabled={loading}>
              <Icon name={s.icon} size={15} /> {s.short || s.name}
            </button>
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
        <button className="btn btn--primary" onClick={save} disabled={loading || !name.trim()}>
          {loading ? "Guardando…" : editing ? "Guardar cambios" : "Agregar alumno"}
        </button>
      </div>
    </Modal>
  );
}

Object.assign(window, { UploadModal, GenerateModal, PickStudentModal, StudentFormModal });
