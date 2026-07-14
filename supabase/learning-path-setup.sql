-- Columna para la línea de tiempo de sesiones (Ruta pedagógica)
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS learning_path JSONB DEFAULT NULL;
