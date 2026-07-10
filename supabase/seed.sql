-- ALIS: limpia datos demo. NO inserta alumnos hardcodeados.
-- Los alumnos reales los crea cada docente desde la app (con teacher_id).
-- Ejecutar solo si quieres borrar filas de prueba antiguas.

DELETE FROM pending;
DELETE FROM suggestions;
DELETE FROM materials;
DELETE FROM students
WHERE teacher_id IS NULL
   OR id IN (
     'javier', 'mateo', 'ana', 'diego',
     'valentina', 'joaquin', 'renata',
     'lucia', 'camila', 'sebastian'
   );
