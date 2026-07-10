# ALIS — Dashboard del docente

ALIS es un panel web **solo para docentes/tutores** (MVP unidireccional). Permite ver métricas, subir evidencia, seguir una ruta pedagógica por alumno y generar material temporal alineado al CNEB/MINEDU.

## Qué hace

- **Login con Google:** acceso del docente (como en la pantalla de bienvenida).
- **Vista de alumnos:** por materia (Matemática, Inglés, Comunicación), con estado y progreso.
- **Perfil del alumno:** dominio por tema, historial y lectura de Alis.
- **Ruta Pedagógica:** nivel actual → objetivo curricular (CNEB), por alumno.
- **Subir resultado y generar material:** evidencia + análisis; el material generado es descargable y no se archiva en un banco.
- **Sugerencias de Alis** y **métricas** simples por materia.

## Cómo funciona

1. El docente inicia sesión con su correo.
2. Se cargan datos desde **Supabase** (o respaldo local en `js/data.jsx`).
3. Acciones globales (Ruta / Subir y generar) piden primero **elegir alumno**.
4. La materia activa filtra alumnos, sugerencias y pendientes.

## Estructura

```
index.html
css/
js/
  auth.js           Sesión del docente
  app.jsx           Rutas y gate de login
  data.jsx / data-service.js
  components/       Sidebar, tarjetas, Tweaks
  views/            Login, Dashboard, Perfil, Ruta, Modales
supabase/seed.sql
```

## Configuración

1. Copia `js/config.example.js` como `js/config.js` con tu URL y key de Supabase.
2. Ejecuta `supabase/seed.sql` en el SQL Editor si usas datos remotos.

## Despliegue

Sitio estático en **Netlify** desde `main`. Sin build.
