// Components.jsx — shared building blocks used by Dashboard + Profile
function AlisLogo({ variant = "stack", className = "" }) {
  const gold = "var(--brand, #FFCC06)";
  const ink = variant === "onLight" ? "var(--ink, #101010)" : "#fff";
  const mark = (
    <svg className="alis-mark" viewBox="0 0 72 64" width="36" height="32" aria-hidden="true">
      <path
        d="M46.5 8.5 L62 18.5 L62 41.5 L46.5 51.5 L31 41.5 L31 18.5 L40 12.5"
        fill="none"
        stroke={gold}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M37 42 L46 20 L55 42"
        fill="none"
        stroke={gold}
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === "mark") {
    return (
      <span className={"alis-logo alis-logo--mark " + className} aria-label="ALIS">
        {mark}
      </span>
    );
  }

  if (variant === "sidebar") {
    return (
      <span className={"alis-logo alis-logo--sidebar " + className}>
        {mark}
        <span className="alis-logo-copy">
          <span className="alis-logo-name" style={{ color: ink }}>ALIS</span>
          <span className="alis-logo-by">
            <span style={{ color: "rgba(255,255,255,.72)" }}>by </span>
            <span style={{ color: gold }}>Fibee</span>
          </span>
        </span>
      </span>
    );
  }

  // stack — login / hero
  return (
    <span className={"alis-logo alis-logo--stack " + className} role="img" aria-label="ALIS by Fibee">
      <svg className="alis-logo-svg" viewBox="0 0 160 168" width="120" height="126">
        <g transform="translate(44 4)">
          <path
            d="M46.5 10.5 L62 20.5 L62 43.5 L46.5 53.5 L31 43.5 L31 20.5 L40 14.5"
            fill="none"
            stroke={gold}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M37 44 L46 22 L55 44"
            fill="none"
            stroke={gold}
            strokeWidth="4.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <text
          x="80"
          y="98"
          textAnchor="middle"
          fill={ink}
          fontFamily="Outfit, Montserrat, Arial, sans-serif"
          fontSize="34"
          fontWeight="700"
          letterSpacing="0.28em"
        >ALIS</text>
        <text
          x="80"
          y="124"
          textAnchor="middle"
          fontFamily="Outfit, Montserrat, Arial, sans-serif"
          fontSize="13"
          fontWeight="500"
          letterSpacing="0.06em"
        >
          <tspan fill={ink}>by </tspan>
          <tspan fill={gold}>Fibee</tspan>
        </text>
        <line x1="72" y1="138" x2="88" y2="138" stroke={gold} strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function Avatar({ student, size = 40 }) {
  const h = student.avatarHue;
  const bg = `linear-gradient(145deg, oklch(0.72 0.13 ${h}), oklch(0.6 0.15 ${h}))`;
  return (
    <span className="avatar" style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}>
      {student.initials}
    </span>
  );
}

function StatusChip({ status, size = "md" }) {
  const s = STATUS[status];
  return (
    <span className={"chip chip--" + size} style={{ background: s.chipBg, color: s.chipInk }}>
      <span className="chip-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

function ProgressBar({ value, status }) {
  const color = STATUS[status].dot;
  return (
    <div className="bar">
      <div className="bar-fill" style={{ width: value + "%", background: color }} />
    </div>
  );
}

function ProgressRing({ value, status, size = 64, stroke = 6 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = STATUS[status].dot;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (value / 100) * c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset .6s cubic-bezier(.2,.7,.2,1)" }}
        />
      </svg>
      <span className="ring-label" style={{ fontSize: size * 0.26 }}>{value}<i>%</i></span>
    </div>
  );
}

function TrendTag({ value }) {
  const up = value >= 0;
  return (
    <span className={"trend " + (up ? "trend--up" : "trend--down")}>
      <Icon name="trending" size={13} style={up ? null : { transform: "scaleY(-1)" }} />
      {up ? "+" : ""}{value}
    </span>
  );
}

// ---- Student card with 3 variants: barra | anillo | minimal ----
function StudentCard({ student, variant, onOpen, onUpload }) {
  const stop = (e, fn) => { e.stopPropagation(); fn(); };

  if (variant === "minimal") {
    return (
      <div className="scard scard--minimal" onClick={onOpen} role="button" tabIndex={0}>
        <Avatar student={student} size={38} />
        <div className="scard-min-id">
          <span className="scard-name">{student.name}</span>
          <span className="scard-meta">{student.grade} · {student.subject}</span>
        </div>
        <StatusChip status={student.status} size="sm" />
        <div className="scard-min-bar">
          <ProgressBar value={student.progress} status={student.status} />
        </div>
        <span className="scard-min-pct">{student.progress}%</span>
        <span className="scard-min-chev"><Icon name="chevron" size={16} /></span>
      </div>
    );
  }

  if (variant === "anillo") {
    return (
      <div className="scard scard--ring" onClick={onOpen} role="button" tabIndex={0}>
        <div className="scard-ring-main">
          <div className="scard-head">
            <Avatar student={student} size={44} />
            <div className="scard-id">
              <span className="scard-name">{student.name}</span>
              <span className="scard-meta">{student.grade} · {student.subject}</span>
            </div>
          </div>
          <div className="scard-ring-foot">
            <StatusChip status={student.status} />
            <TrendTag value={student.trend} />
          </div>
        </div>
        <div className="scard-ring-side">
          <ProgressRing value={student.progress} status={student.status} size={72} stroke={7} />
          <button className="scard-icon-btn" onClick={(e) => stop(e, onUpload)} title="Subir resultado">
            <Icon name="upload" size={17} />
          </button>
        </div>
      </div>
    );
  }

  // default: "barra"
  return (
    <div className="scard scard--bar" onClick={onOpen} role="button" tabIndex={0}>
      <div className="scard-head">
        <Avatar student={student} size={44} />
        <div className="scard-id">
          <span className="scard-name">{student.name}</span>
          <span className="scard-meta">{student.grade} · {student.subject}</span>
        </div>
        <StatusChip status={student.status} />
      </div>
      <div className="scard-prog">
        <div className="scard-prog-top">
          <span className="scard-prog-label">Progreso</span>
          <span className="scard-prog-val">{student.progress}% <TrendTag value={student.trend} /></span>
        </div>
        <ProgressBar value={student.progress} status={student.status} />
      </div>
    </div>
  );
}

Object.assign(window, { AlisLogo, Avatar, StatusChip, ProgressBar, ProgressRing, TrendTag, StudentCard });
