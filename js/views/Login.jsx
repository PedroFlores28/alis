// Login.jsx — acceso del docente con Google (como la imagen de referencia)
const { useState } = React;

function GoogleIcon() {
  return (
    <svg className="login-google-icon" viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.1 5.5l.1.1 6.2 5.2C39.2 37.3 44 33 44 24c0-1.3-.1-2.5-.4-3.5z"/>
    </svg>
  );
}

function LoginView({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // onSuccess se usa tras el redirect de OAuth (sesión ya creada)
  void onSuccess;

  const loginGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      // Redirección a Google; al volver, AlisRoot toma la sesión
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión con Google.");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-wrap">
          <img
            src={(window.__resources && window.__resources.alisLogo) || "assets/images/alis-logo.png"}
            alt="ALIS"
            className="login-logo"
          />
        </div>

        <h1 className="login-title">Bienvenido a Alis</h1>
        <p className="login-sub">Tu panel inteligente para tutores y docentes</p>

        {error && <p className="login-error">{error}</p>}

        <button type="button" className="login-google-btn" onClick={loginGoogle} disabled={loading}>
          <GoogleIcon />
          {loading ? "Conectando…" : "Iniciar sesión con Google"}
        </button>

        <p className="login-legal">
          Al ingresar, aceptas nuestros Términos de Servicio y Políticas de Privacidad.
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { LoginView });
