# Edge Functions ALIS

Secret único requerido: `GEMINI_API_KEY`  
Modelo: `gemini-3.1-flash-lite` (Flash-Lite actual, económico)

## Funciones

| Nombre | Para qué | Modelo |
|---|---|---|
| `analyze-evidence` | Lee foto/PDF y analiza (describe figuras en texto) | Gemini 3.1 Flash-Lite |
| `generate-material` | Genera ejercicios de refuerzo | Gemini 3.1 Flash-Lite |

## Desplegar (dashboard)

1. Edge Functions → Secrets → agrega `GEMINI_API_KEY`
2. Para cada función (`analyze-evidence` y `generate-material`):
   - Abre / crea la función
   - Pega el código de `supabase/functions/<nombre>/index.ts`
   - Deploy

## URLs

- `https://bnmaxhwysrtrodmxxujy.supabase.co/functions/v1/analyze-evidence`
- `https://bnmaxhwysrtrodmxxujy.supabase.co/functions/v1/generate-material`

## CLI (opcional)

```bash
npx supabase functions deploy analyze-evidence
npx supabase functions deploy generate-material
```
