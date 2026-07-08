-- Seed completo: 10 alumnos + sugerencias + pendientes + materiales
-- Ejecutar en Supabase SQL Editor (reemplaza datos existentes)

DELETE FROM pending;
DELETE FROM suggestions;
DELETE FROM materials;
DELETE FROM students;

INSERT INTO students (id, subject_id, name, initials, grade, progress, status, trend, avatar_hue, last_session, next_session, sessions, focus, note, topics, history) VALUES (
  'javier', 'mate', 'Javier Torres', 'JT', '2° Secundaria', 45, 'riesgo', -6, 18, 'Hace 2 días', 'Hoy · 4:30 p.m.', 14, 'Fracciones y operaciones con decimales', '3 sesiones seguidas con dificultad en fracciones.', '[{"name":"Números enteros","score":78},{"name":"Fracciones","score":38},{"name":"Decimales","score":44},{"name":"Proporcionalidad","score":52}]'::jsonb, '[{"label":"Práctica de fracciones","date":"5 jun","score":42,"type":"Evaluación"},{"label":"Quiz: operaciones combinadas","date":"1 jun","score":48,"type":"Quiz"},{"label":"Tarea: decimales","date":"28 may","score":55,"type":"Tarea"}]'::jsonb
);
INSERT INTO students (id, subject_id, name, initials, grade, progress, status, trend, avatar_hue, last_session, next_session, sessions, focus, note, topics, history) VALUES (
  'mateo', 'mate', 'Mateo Quispe', 'MQ', '2° Secundaria', 72, 'normal', 4, 230, 'Ayer', 'Mié · 5:00 p.m.', 19, 'Ecuaciones de primer grado', 'Progreso constante. Mantiene el ritmo esperado.', '[{"name":"Números enteros","score":80},{"name":"Fracciones","score":70},{"name":"Ecuaciones","score":66},{"name":"Geometría","score":72}]'::jsonb, '[{"label":"Quiz: ecuaciones","date":"6 jun","score":74,"type":"Quiz"},{"label":"Práctica: geometría","date":"2 jun","score":71,"type":"Evaluación"},{"label":"Tarea: fracciones","date":"29 may","score":68,"type":"Tarea"}]'::jsonb
);
INSERT INTO students (id, subject_id, name, initials, grade, progress, status, trend, avatar_hue, last_session, next_session, sessions, focus, note, topics, history) VALUES (
  'ana', 'mate', 'Ana Flores', 'AF', '1° Secundaria', 61, 'atencion', -2, 300, 'Hace 4 días', 'Vie · 4:00 p.m.', 11, 'Operaciones con números naturales', 'Bajó el ritmo esta semana. Conviene reforzar pronto.', '[{"name":"Números naturales","score":66},{"name":"Múltiplos y divisores","score":58},{"name":"Potencias","score":55},{"name":"Geometría básica","score":64}]'::jsonb, '[{"label":"Quiz: múltiplos","date":"3 jun","score":59,"type":"Quiz"},{"label":"Tarea: potencias","date":"30 may","score":56,"type":"Tarea"},{"label":"Práctica: naturales","date":"26 may","score":67,"type":"Evaluación"}]'::jsonb
);
INSERT INTO students (id, subject_id, name, initials, grade, progress, status, trend, avatar_hue, last_session, next_session, sessions, focus, note, topics, history) VALUES (
  'diego', 'mate', 'Diego Ramos', 'DR', '3° Secundaria', 84, 'destacado', 7, 200, 'Hace 2 días', 'Jue · 6:00 p.m.', 21, 'Funciones lineales y cuadráticas', 'Rinde por encima del nivel. Listo para retos avanzados.', '[{"name":"Álgebra","score":88},{"name":"Funciones","score":82},{"name":"Geometría analítica","score":80},{"name":"Estadística","score":86}]'::jsonb, '[{"label":"Evaluación: funciones","date":"5 jun","score":87,"type":"Evaluación"},{"label":"Quiz: álgebra","date":"1 jun","score":83,"type":"Quiz"},{"label":"Reto: sistemas","date":"27 may","score":90,"type":"Reto"}]'::jsonb
);
INSERT INTO students (id, subject_id, name, initials, grade, progress, status, trend, avatar_hue, last_session, next_session, sessions, focus, note, topics, history) VALUES (
  'valentina', 'ingles', 'Valentina Cruz', 'VC', '2° Secundaria', 82, 'destacado', 6, 160, 'Ayer', 'Mar · 5:30 p.m.', 18, 'Speaking — fluidez en presente y pasado', 'Excelente comprensión. Lista para conversación más libre.', '[{"name":"Reading","score":86},{"name":"Listening","score":84},{"name":"Grammar","score":78},{"name":"Speaking","score":80}]'::jsonb, '[{"label":"Listening test: Unit 4","date":"6 jun","score":85,"type":"Evaluación"},{"label":"Quiz: past simple","date":"2 jun","score":81,"type":"Quiz"},{"label":"Reading: short story","date":"29 may","score":79,"type":"Tarea"}]'::jsonb
);
INSERT INTO students (id, subject_id, name, initials, grade, progress, status, trend, avatar_hue, last_session, next_session, sessions, focus, note, topics, history) VALUES (
  'joaquin', 'ingles', 'Joaquín Mendoza', 'JM', '1° Secundaria', 53, 'riesgo', -5, 40, 'Hace 3 días', 'Hoy · 6:30 p.m.', 9, 'Vocabulario básico y verbo to be', 'Le cuesta el vocabulario base. Conviene reforzar con práctica visual.', '[{"name":"Vocabulary","score":48},{"name":"Grammar (to be)","score":50},{"name":"Listening","score":58},{"name":"Reading","score":56}]'::jsonb, '[{"label":"Quiz: verb to be","date":"4 jun","score":47,"type":"Quiz"},{"label":"Vocabulary check","date":"31 may","score":51,"type":"Evaluación"},{"label":"Tarea: family words","date":"27 may","score":55,"type":"Tarea"}]'::jsonb
);
INSERT INTO students (id, subject_id, name, initials, grade, progress, status, trend, avatar_hue, last_session, next_session, sessions, focus, note, topics, history) VALUES (
  'renata', 'ingles', 'Renata Silva', 'RS', '3° Secundaria', 69, 'normal', 3, 280, 'Hace 2 días', 'Vie · 5:00 p.m.', 16, 'Writing — párrafos con conectores', 'Avance estable. Puede mejorar la producción escrita.', '[{"name":"Reading","score":72},{"name":"Listening","score":70},{"name":"Grammar","score":68},{"name":"Writing","score":64}]'::jsonb, '[{"label":"Writing: opinion text","date":"5 jun","score":66,"type":"Evaluación"},{"label":"Quiz: connectors","date":"1 jun","score":71,"type":"Quiz"},{"label":"Reading: article","date":"28 may","score":69,"type":"Tarea"}]'::jsonb
);
INSERT INTO students (id, subject_id, name, initials, grade, progress, status, trend, avatar_hue, last_session, next_session, sessions, focus, note, topics, history) VALUES (
  'lucia', 'comunicacion', 'Lucía Paredes', 'LP', '3° Secundaria', 88, 'destacado', 9, 150, 'Hace 3 días', 'Jue · 3:30 p.m.', 22, 'Comprensión lectora — textos argumentativos', 'Rendimiento sobresaliente. Lista para retos avanzados.', '[{"name":"Comprensión lectora","score":92},{"name":"Producción de textos","score":85},{"name":"Gramática","score":88},{"name":"Ortografía","score":86}]'::jsonb, '[{"label":"Ensayo argumentativo","date":"4 jun","score":91,"type":"Evaluación"},{"label":"Quiz: conectores","date":"31 may","score":89,"type":"Quiz"},{"label":"Lectura crítica","date":"27 may","score":87,"type":"Tarea"}]'::jsonb
);
INSERT INTO students (id, subject_id, name, initials, grade, progress, status, trend, avatar_hue, last_session, next_session, sessions, focus, note, topics, history) VALUES (
  'camila', 'comunicacion', 'Camila Ríos', 'CR', '2° Secundaria', 64, 'atencion', -3, 350, 'Hace 4 días', 'Mié · 4:30 p.m.', 13, 'Producción de textos narrativos', 'Bajó su ritmo. Refuerzo en estructura de textos sugerido.', '[{"name":"Comprensión lectora","score":70},{"name":"Producción de textos","score":56},{"name":"Gramática","score":62},{"name":"Ortografía","score":68}]'::jsonb, '[{"label":"Texto narrativo","date":"3 jun","score":58,"type":"Evaluación"},{"label":"Quiz: ortografía","date":"30 may","score":66,"type":"Quiz"},{"label":"Lectura: cuento","date":"26 may","score":67,"type":"Tarea"}]'::jsonb
);
INSERT INTO students (id, subject_id, name, initials, grade, progress, status, trend, avatar_hue, last_session, next_session, sessions, focus, note, topics, history) VALUES (
  'sebastian', 'comunicacion', 'Sebastián Vega', 'SV', '1° Secundaria', 71, 'normal', 2, 110, 'Ayer', 'Vie · 3:00 p.m.', 12, 'Comprensión de textos descriptivos', 'Progreso constante. Buen manejo de vocabulario.', '[{"name":"Comprensión lectora","score":74},{"name":"Producción de textos","score":68},{"name":"Gramática","score":70},{"name":"Ortografía","score":72}]'::jsonb, '[{"label":"Comprensión: descripción","date":"6 jun","score":73,"type":"Evaluación"},{"label":"Quiz: sustantivos","date":"2 jun","score":70,"type":"Quiz"},{"label":"Tarea: redacción","date":"29 may","score":69,"type":"Tarea"}]'::jsonb
);

INSERT INTO suggestions (id, student_id, title, body, tag, cta) VALUES ('s1', 'javier', 'Javier necesita refuerzo en fracciones', 'Lleva 3 sesiones con dificultad en fracciones. Te sugerimos una práctica de refuerzo de 10 ejercicios graduados.', 'Refuerzo', 'Generar práctica');
INSERT INTO suggestions (id, student_id, title, body, tag, cta) VALUES ('s2', 'ana', 'Ana bajó su ritmo esta semana', 'Su progreso cayó 2 puntos. Una sesión corta de repaso de múltiplos podría reencauzarla.', 'Seguimiento', 'Ver sugerencia');
INSERT INTO suggestions (id, student_id, title, body, tag, cta) VALUES ('s3', 'diego', 'Diego está listo para un reto', 'Rinde 84% en funciones. Propón un reto de sistemas de ecuaciones para mantenerlo desafiado.', 'Avance', 'Generar reto');
INSERT INTO suggestions (id, student_id, title, body, tag, cta) VALUES ('s4', 'joaquin', 'Joaquín necesita reforzar vocabulario', 'Su vocabulario base está en 48%. Una práctica visual con flashcards puede ayudarlo a avanzar.', 'Refuerzo', 'Generar práctica');
INSERT INTO suggestions (id, student_id, title, body, tag, cta) VALUES ('s5', 'valentina', 'Valentina está lista para conversación', 'Domina el listening (84%). Propón un ejercicio de speaking más libre sobre rutinas.', 'Avance', 'Generar reto');
INSERT INTO suggestions (id, student_id, title, body, tag, cta) VALUES ('s6', 'camila', 'Camila necesita estructura de textos', 'Su producción escrita está en 56%. Una guía paso a paso de textos narrativos la ayudaría.', 'Seguimiento', 'Ver sugerencia');

INSERT INTO pending (id, student_id, label, kind, time, icon) VALUES ('p1', 'javier', 'Práctica de fracciones', 'Foto subida', 'Hace 1 h', 'image');
INSERT INTO pending (id, student_id, label, kind, time, icon) VALUES ('p2', 'mateo', 'Quiz de ecuaciones', 'PDF', 'Hace 3 h', 'file');
INSERT INTO pending (id, student_id, label, kind, time, icon) VALUES ('p3', 'valentina', 'Listening test: Unit 4', 'PDF', 'Hace 2 h', 'file');
INSERT INTO pending (id, student_id, label, kind, time, icon) VALUES ('p4', 'joaquin', 'Quiz: verb to be', 'Foto subida', 'Ayer', 'image');
INSERT INTO pending (id, student_id, label, kind, time, icon) VALUES ('p5', 'lucia', 'Ensayo argumentativo', 'PDF', 'Ayer', 'file');
INSERT INTO pending (id, student_id, label, kind, time, icon) VALUES ('p6', 'camila', 'Texto narrativo', 'Foto subida', 'Hace 5 h', 'image');

INSERT INTO materials (id, subject_id, type, title, level, items, date, is_new) VALUES ('m1', 'mate', 'Práctica', 'Refuerzo de fracciones heterogéneas', '2° Secundaria', 10, 'Hoy', true);
INSERT INTO materials (id, subject_id, type, title, level, items, date, is_new) VALUES ('m2', 'mate', 'Quiz', 'Operaciones combinadas', '2° Secundaria', 8, 'Hoy', true);
INSERT INTO materials (id, subject_id, type, title, level, items, date, is_new) VALUES ('m3', 'mate', 'Reto', 'Sistemas de ecuaciones', '3° Secundaria', 6, 'Hace 2 días', false);
INSERT INTO materials (id, subject_id, type, title, level, items, date, is_new) VALUES ('m4', 'mate', 'Práctica', 'Números naturales y potencias', '1° Secundaria', 12, 'Hace 4 días', false);
INSERT INTO materials (id, subject_id, type, title, level, items, date, is_new) VALUES ('m5', 'ingles', 'Práctica', 'Vocabulary flashcards: family', '1° Secundaria', 14, 'Ayer', true);
INSERT INTO materials (id, subject_id, type, title, level, items, date, is_new) VALUES ('m6', 'ingles', 'Quiz', 'Past simple — regular verbs', '2° Secundaria', 10, 'Hace 3 días', false);
INSERT INTO materials (id, subject_id, type, title, level, items, date, is_new) VALUES ('m7', 'ingles', 'Reto', 'Speaking prompts: daily routines', '2° Secundaria', 8, 'Hace 5 días', false);
INSERT INTO materials (id, subject_id, type, title, level, items, date, is_new) VALUES ('m8', 'comunicacion', 'Práctica', 'Estructura de textos narrativos', '2° Secundaria', 9, 'Hace 1 día', false);
INSERT INTO materials (id, subject_id, type, title, level, items, date, is_new) VALUES ('m9', 'comunicacion', 'Quiz', 'Conectores lógicos', '3° Secundaria', 10, 'Hace 6 días', false);
