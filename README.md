# ALIS — Dashboard del docente

ALIS es un panel web para tutores y docentes. Permite ver el progreso de sus alumnos por materia, recibir sugerencias de refuerzo con IA y gestionar material didáctico.

## Qué hace

- **Vista de alumnos:** lista de estudiantes filtrada por materia (Matemática, Inglés, Comunicación), con estado (en riesgo, atención, normal, destacado) y progreso.
- **Perfil del alumno:** detalle de dominio por tema, historial de resultados y lectura sugerida por Alis.
- **Sugerencias de Alis:** recomendaciones automáticas para generar prácticas, retos o seguimiento según el rendimiento.
- **Pendientes:** resultados subidos (fotos o PDF) que el docente aún no ha revisado.
- **Banco de material:** repositorio de prácticas, quizzes y retos organizados por materia y nivel.
- **Subir resultado:** modal para cargar un archivo y simular el análisis con Alis.
- **Generar material:** modal para crear ejercicios alineados al currículo MINEDU según el alumno y la materia.

## Cómo funciona

1. Al abrir la app, se intenta cargar los datos desde **Supabase** (`js/config.js` + `js/data-service.js`).
2. Si Supabase no está configurado o falla, se usan los **datos locales** de respaldo en `js/data.jsx`.
3. La navegación es por vistas: alumnos, perfil, banco de material y configuración (esta última aún no implementada).
4. La materia activa filtra alumnos, sugerencias y pendientes en todo el panel.

## Estructura del proyecto

```
index.html          Punto de entrada
css/                Estilos y fuentes
js/
  app.jsx           Lógica principal y rutas
  data.jsx          Datos locales y componente Icon
  data-service.js   Carga de datos desde Supabase
  components/       Sidebar, tarjetas de alumno, panel Tweaks
  views/            Dashboard, perfil, banco y modales
assets/             Logo e imágenes
supabase/seed.sql   Datos de ejemplo para la base de datos
netlify.toml        Configuración de despliegue
```

## Configuración

1. Copia `js/config.example.js` como `js/config.js`.
2. Pega la URL y la Publishable key de tu proyecto Supabase.
3. Ejecuta `supabase/seed.sql` en el SQL Editor de Supabase para cargar datos de prueba.

## Despliegue

Sitio estático publicado en **Netlify** desde la rama `main` de GitHub. No requiere build: se sirven directamente `index.html`, `css/`, `js/` y `assets/`.
