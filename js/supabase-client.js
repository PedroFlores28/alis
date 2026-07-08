(function () {
  const cfg = window.ALIS_CONFIG;
  if (!cfg?.supabaseUrl || !cfg?.supabaseKey) {
    console.warn("[ALIS] Falta js/config.js — usando datos locales de respaldo.");
    window.supabaseClient = null;
    return;
  }
  if (!window.supabase) {
    console.error("[ALIS] Librería @supabase/supabase-js no cargada.");
    window.supabaseClient = null;
    return;
  }
  window.supabaseClient = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
})();
