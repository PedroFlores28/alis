# Desplegar analyze-evidence

El secret `ANTHROPIC_API_KEY` ya debe existir en Edge Functions → Secrets.

## Opción A — Desde el dashboard (sin CLI)

1. Edge Functions → **Functions** → **Via Editor** / Deploy your first function  
2. Nombre de la función: `analyze-evidence`  
3. Borra el código de ejemplo y pega el contenido de:
   `supabase/functions/analyze-evidence/index.ts`  
4. **Deploy**

## Opción B — CLI

```bash
npx supabase login
npx supabase link --project-ref bnmaxhwysrtrodmxxujy
npx supabase functions deploy analyze-evidence
```

La URL quedará:
`https://bnmaxhwysrtrodmxxujy.supabase.co/functions/v1/analyze-evidence`
