-- Competencia MINEDU en alumnos (reemplaza grado como eje principal)
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS competence_id TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS students_competence_id_idx ON students (competence_id);
