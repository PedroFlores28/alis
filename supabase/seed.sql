-- Paso 3: datos de prueba (ejecutar en SQL Editor → New query → Run)
-- Si ya hay filas, ON CONFLICT evita duplicados.

INSERT INTO students (id, subject_id, name, initials, grade, progress, status, trend, avatar_hue, last_session, next_session, sessions, focus, note, topics, history) VALUES
('javier', 'mate', 'Javier Torres', 'JT', '2° Secundaria', 45, 'riesgo', -6, 18, 'Hace 2 días', 'Hoy · 4:30 p.m.', 14, 'Fracciones y operaciones con decimales', '3 sesiones seguidas con dificultad en fracciones.', '[{"name":"Fracciones","score":38}]'::jsonb, '[{"label":"Práctica de fracciones","date":"5 jun","score":42,"type":"Evaluación"}]'::jsonb),
('mateo', 'mate', 'Mateo Quispe', 'MQ', '2° Secundaria', 72, 'normal', 4, 230, 'Ayer', 'Mié · 5:00 p.m.', 19, 'Ecuaciones de primer grado', 'Progreso constante.', '[{"name":"Ecuaciones","score":66}]'::jsonb, '[]'::jsonb),
('valentina', 'ingles', 'Valentina Cruz', 'VC', '2° Secundaria', 82, 'destacado', 6, 160, 'Ayer', 'Mar · 5:30 p.m.', 18, 'Speaking — fluidez', 'Excelente comprensión.', '[]'::jsonb, '[]'::jsonb),
('lucia', 'comunicacion', 'Lucía Paredes', 'LP', '3° Secundaria', 88, 'destacado', 9, 150, 'Hace 3 días', 'Jue · 3:30 p.m.', 22, 'Comprensión lectora', 'Rendimiento sobresaliente.', '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO suggestions (id, student_id, title, body, tag, cta) VALUES
('s1', 'javier', 'Javier necesita refuerzo en fracciones', 'Lleva 3 sesiones con dificultad en fracciones.', 'Refuerzo', 'Generar práctica'),
('s4', 'valentina', 'Valentina está lista para conversación', 'Domina el listening. Propón speaking libre.', 'Avance', 'Generar reto')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pending (id, student_id, label, kind, time, icon) VALUES
('p1', 'javier', 'Práctica de fracciones', 'Foto subida', 'Hace 1 h', 'image'),
('p3', 'valentina', 'Listening test: Unit 4', 'PDF', 'Hace 2 h', 'file')
ON CONFLICT (id) DO NOTHING;

INSERT INTO materials (id, subject_id, type, title, level, items, date, is_new) VALUES
('m1', 'mate', 'Práctica', 'Refuerzo de fracciones heterogéneas', '2° Secundaria', 10, 'Hoy', true),
('m5', 'ingles', 'Práctica', 'Vocabulary flashcards: family', '1° Secundaria', 14, 'Ayer', true),
('m8', 'comunicacion', 'Práctica', 'Estructura de textos narrativos', '2° Secundaria', 9, 'Hace 1 día', false)
ON CONFLICT (id) DO NOTHING;
