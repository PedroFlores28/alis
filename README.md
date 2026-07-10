# ALIS — Dashboard del docente

ALIS es un panel **solo para docentes/tutores**. Login con Google, alumnos propios, evidencia, ruta pedagógica con CNEB y métricas simples.

## Qué hace hoy

- Login con Google
- Gestión de alumnos (crear / editar / eliminar) por docente
- 3 materias fijas: Matemática, Inglés, Comunicación
- Subida real de evidencia (foto/PDF, web y móvil)
- Base CNEB mínima (competencias por grado/materia)
- Ruta Pedagógica: nivel actual → objetivo CNEB
- Historial, sugerencias y métricas (aún simples / parciales)

## Setup Supabase (obligatorio)

1. `js/config.js` con URL + Publishable key
2. Ejecuta **`supabase/mvp-setup.sql`** en el SQL Editor (alumnos, CNEB, evidencias, Storage)
3. Auth → Google provider + URL Configuration (`https://alis.fibee.pro`)

## Pendiente del MVP

- OCR + análisis IA real de respuestas
- Generador de material con IA real (descarga temporal)
- Sugerencias automáticas desde evidencia
- Historial académico más rico
- Gestión avanzada de materias (opcional; las 3 fijas bastan)

## Despliegue

Sitio estático en Netlify desde `main`.
