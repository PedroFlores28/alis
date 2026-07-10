-- Sugerencias e ítems pendientes por docente
-- Ejecutar en SQL Editor si quieres persistir sugerencias en Supabase
-- (si no lo corres, Alis igual guarda sugerencias en el navegador)

ALTER TABLE suggestions
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE pending
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS suggestions_teacher_id_idx ON suggestions (teacher_id);
CREATE INDEX IF NOT EXISTS pending_teacher_id_idx ON pending (teacher_id);

ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "teachers_select_own_suggestions" ON suggestions;
DROP POLICY IF EXISTS "teachers_insert_own_suggestions" ON suggestions;
DROP POLICY IF EXISTS "teachers_delete_own_suggestions" ON suggestions;

CREATE POLICY "teachers_select_own_suggestions" ON suggestions
  FOR SELECT TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "teachers_insert_own_suggestions" ON suggestions
  FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "teachers_delete_own_suggestions" ON suggestions
  FOR DELETE TO authenticated USING (teacher_id = auth.uid());

ALTER TABLE pending ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "teachers_select_own_pending" ON pending;
DROP POLICY IF EXISTS "teachers_insert_own_pending" ON pending;
DROP POLICY IF EXISTS "teachers_delete_own_pending" ON pending;

CREATE POLICY "teachers_select_own_pending" ON pending
  FOR SELECT TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "teachers_insert_own_pending" ON pending
  FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "teachers_delete_own_pending" ON pending
  FOR DELETE TO authenticated USING (teacher_id = auth.uid());
