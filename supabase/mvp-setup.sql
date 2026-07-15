-- ALIS MVP: alumnos por docente + CNEB + evidencias
-- Ejecutar TODO este archivo en Supabase → SQL Editor

-- 1) Alumnos ligados al docente
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS learning_path JSONB DEFAULT NULL;

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS competence_id TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS students_teacher_id_idx ON students (teacher_id);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "teachers_select_own_students" ON students;
DROP POLICY IF EXISTS "teachers_insert_own_students" ON students;
DROP POLICY IF EXISTS "teachers_update_own_students" ON students;
DROP POLICY IF EXISTS "teachers_delete_own_students" ON students;

CREATE POLICY "teachers_select_own_students" ON students
  FOR SELECT TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "teachers_insert_own_students" ON students
  FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "teachers_update_own_students" ON students
  FOR UPDATE TO authenticated USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "teachers_delete_own_students" ON students
  FOR DELETE TO authenticated USING (teacher_id = auth.uid());

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subjects_read_all" ON subjects;
CREATE POLICY "subjects_read_all" ON subjects
  FOR SELECT TO authenticated USING (true);

-- 2) Base curricular CNEB mínima (competencias / capacidades por grado y materia)
CREATE TABLE IF NOT EXISTS cneb_items (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  grade TEXT NOT NULL,
  competence TEXT NOT NULL,
  capacity TEXT NOT NULL,
  performance TEXT NOT NULL
);

ALTER TABLE cneb_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cneb_read_authenticated" ON cneb_items;
CREATE POLICY "cneb_read_authenticated" ON cneb_items
  FOR SELECT TO authenticated USING (true);

DELETE FROM cneb_items;

INSERT INTO cneb_items (id, subject_id, grade, competence, capacity, performance) VALUES
('mate-1-resuelve', 'mate', '1° Secundaria', 'Resuelve problemas de cantidad', 'Traduce cantidades a expresiones numéricas', 'Resuelve problemas con números naturales, enteros y operaciones básicas.'),
('mate-2-resuelve', 'mate', '2° Secundaria', 'Resuelve problemas de cantidad', 'Usa fracciones, razones y proporciones', 'Resuelve problemas con fracciones, decimales y proporcionalidad.'),
('mate-3-resuelve', 'mate', '3° Secundaria', 'Resuelve problemas de regularidad, equivalencia y cambio', 'Modela con ecuaciones y funciones', 'Plantea y resuelve ecuaciones y relaciones funcionales simples.'),
('ing-1-comunica', 'ingles', '1° Secundaria', 'Se comunica oralmente en inglés', 'Obtiene información del interlocutor', 'Comprende y produce mensajes orales simples sobre sí mismo y su entorno.'),
('ing-2-lee', 'ingles', '2° Secundaria', 'Lee diversos tipos de textos en inglés', 'Obtiene información del texto escrito', 'Comprende textos cortos e identifica idea principal y detalles.'),
('ing-3-escribe', 'ingles', '3° Secundaria', 'Escribe diversos tipos de textos en inglés', 'Organiza y desarrolla ideas en torno a un tema', 'Produce textos coherentes con conectores y vocabulario adecuado al grado.'),
('com-1-lee', 'comunicacion', '1° Secundaria', 'Lee diversos tipos de textos en lengua materna', 'Obtiene información del texto escrito', 'Identifica información explícita e idea principal en textos descriptivos.'),
('com-2-escribe', 'comunicacion', '2° Secundaria', 'Escribe diversos tipos de textos en lengua materna', 'Organiza y desarrolla ideas', 'Produce textos narrativos con estructura clara (inicio, nudo, desenlace).'),
('com-3-lee', 'comunicacion', '3° Secundaria', 'Lee diversos tipos de textos en lengua materna', 'Infiere e interpreta información', 'Analiza textos argumentativos e identifica punto de vista y argumentos.');

-- 3) Evidencias subidas (archivo real en Storage)
CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded',
  analysis JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS evidence_teacher_idx ON evidence (teacher_id);
CREATE INDEX IF NOT EXISTS evidence_student_idx ON evidence (student_id);

ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "evidence_select_own" ON evidence;
DROP POLICY IF EXISTS "evidence_insert_own" ON evidence;
DROP POLICY IF EXISTS "evidence_update_own" ON evidence;

CREATE POLICY "evidence_select_own" ON evidence
  FOR SELECT TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "evidence_insert_own" ON evidence
  FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "evidence_update_own" ON evidence
  FOR UPDATE TO authenticated USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- 4) Bucket de Storage (si ya existe, ignora el error al recrear políticas)
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "evidence_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "evidence_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "evidence_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "evidence_storage_delete" ON storage.objects;

CREATE POLICY "evidence_storage_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'evidence' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "evidence_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'evidence' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "evidence_storage_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'evidence' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "evidence_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'evidence' AND (storage.foldername(name))[1] = auth.uid()::text);
