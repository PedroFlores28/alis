# Edge Functions ALIS

Secret requerido (ya en el proyecto): `ANTHROPIC_API_KEY`

## Funciones

| Nombre | Para qué |
|---|---|
| `analyze-evidence` | Lee foto/PDF y analiza con Haiku |
| `generate-material` | Genera ejercicios de refuerzo con Haiku |

## Desplegar (dashboard)

Para **cada** función:

1. Edge Functions → **Functions** → Via Editor / Deploy  
2. Nombre exacto: `analyze-evidence` o `generate-material`  
3. Pega el código de:
   - `supabase/functions/analyze-evidence/index.ts`
   - `supabase/functions/generate-material/index.ts`
4. **Deploy**

## URLs

- `https://bnmaxhwysrtrodmxxujy.supabase.co/functions/v1/analyze-evidence`
- `https://bnmaxhwysrtrodmxxujy.supabase.co/functions/v1/generate-material`

## CLI (opcional)

```bash
npx supabase functions deploy analyze-evidence
npx supabase functions deploy generate-material
```
