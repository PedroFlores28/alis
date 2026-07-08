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

// ---------- Upload result ----------
function UploadModal({ preset, students, onClose }) {
  const [studentId, setStudentId] = useState(preset ? preset.id : students[0].id);
  const [hasFile, setHasFile] = useState(false);
  const [stage, setStage] = useState("form");
  const student = byId(studentId);
  const c = SUBJECT_CONTENT[student.subjectId];

  const analyze = () => { setStage("analyzing"); setTimeout(() => setStage("done"), 1900); };

  return (
    <Modal icon="upload" title="Subir resultado" sub="Sube una foto o PDF y Alis lo analiza por ti." onClose={onClose}>
      <div className="modal-body">
        {stage !== "done" && (
          <>
            <label className="field-label">Alumno · {student.subject}</label>
            <StudentPicker value={studentId} onChange={(id) => { setStudentId(id); setHasFile(false); }} students={students} />

            <label className="field-label">Archivo del resultado</label>
            <button className={"dropzone" + (hasFile ? " has-file" : "")} onClick={() => setHasFile(true)} disabled={stage === "analyzing"}>
              {hasFile ? (
                <div className="dropzone-file">
                  <span className="dropzone-thumb"><Icon name="image" size={22} /></span>
                  <span className="dropzone-file-meta"><strong>{c.file}</strong><em>1.8 MB · listo para analizar</em></span>
                  <span className="dropzone-ok"><Icon name="check" size={16} /></span>
                </div>
              ) : (
                <div className="dropzone-empty">
                  <span className="dropzone-icon"><Icon name="image" size={26} /></span>
                  <strong>Arrastra una foto o PDF aquí</strong>
                  <em>o haz clic para seleccionar · JPG, PNG, PDF</em>
                </div>
              )}
            </button>

            {stage === "analyzing" && (
              <div className="analyzing"><span className="spinner" />Analizando con Alis · leyendo respuestas y comparando con el currículo MINEDU…</div>
            )}
          </>
        )}

        {stage === "done" && (
          <div className="result">
            <div className="result-banner">
              <span className="result-score">{c.score}%</span>
              <div className="result-banner-txt"><strong>Análisis listo</strong><span>{c.topicTitle} · {student.name}</span></div>
              <StatusChip status={c.status} />
            </div>
            <div className="result-block">
              <p className="result-h"><span className="ai-badge ai-badge--sm"><Icon name="sparkles" size={13} /></span> Lo que vio Alis</p>
              <ul className="result-list">
                {c.obs.map((o, i) => (
                  <li key={i}><Icon name={o.ok ? "check" : "alert"} size={15} style={{ color: o.ok ? "var(--good)" : "var(--risk)" }} /> {o.t}</li>
                ))}
              </ul>
            </div>
            <div className="result-next"><span>Sugerencia: {c.next}</span></div>
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
            <button className="btn btn--primary" disabled={!hasFile || stage === "analyzing"} onClick={analyze}><Icon name="sparkles" size={16} /> Analizar con Alis</button>
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
            <button className="btn btn--primary" onClick={onClose}><Icon name="check" size={16} /> Guardar en banco</button>
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

Object.assign(window, { UploadModal, GenerateModal });
