# Edge Functions ALIS

Secret único requerido: `OPENAI_API_KEY`

## Funciones

| Nombre | Para qué | Modelo |
|---|---|---|
| `analyze-evidence` | Lee foto/PDF y analiza (describe figuras en texto) | GPT-4o-mini |
| `generate-material` | Genera ejercicios de refuerzo | GPT-4o-mini |

## Desplegar (dashboard)

1. Edge Functions → Secrets → agrega `OPENAI_API_KEY`
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
