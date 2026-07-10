-- Gestión de alumnos por docente (ejecutar en Supabase SQL Editor)
-- Vincula cada alumno al usuario autenticado (Google)

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS students_teacher_id_idx ON students (teacher_id);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers_select_own_students" ON students;
DROP POLICY IF EXISTS "teachers_insert_own_students" ON students;
DROP POLICY IF EXISTS "teachers_update_own_students" ON students;
DROP POLICY IF EXISTS "teachers_delete_own_students" ON students;

CREATE POLICY "teachers_select_own_students" ON students
  FOR SELECT TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "teachers_insert_own_students" ON students
  FOR INSERT TO authenticated
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "teachers_update_own_students" ON students
  FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "teachers_delete_own_students" ON students
  FOR DELETE TO authenticated
  USING (teacher_id = auth.uid());

-- Lectura pública de materias (si aún no hay política)
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subjects_read_all" ON subjects;
CREATE POLICY "subjects_read_all" ON subjects
  FOR SELECT TO authenticated
  USING (true);
