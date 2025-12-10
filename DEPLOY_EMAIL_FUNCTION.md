# Deploy Edge Function per Invio Email Inviti

> **TODO per domani**: Segui questi passaggi per completare la configurazione email

## Configurazione Completata
- Edge Function creata: `supabase/functions/send-team-invite/index.ts`
- API Key Resend configurata nel Supabase Dashboard
- TeamService aggiornato per chiamare la Edge Function

## Deploy della Edge Function

### Opzione 1: Deploy via Supabase Dashboard (Consigliato)

1. Vai su https://supabase.com/dashboard/project/mhcdxqhhlrujbjxtgnmz/functions
2. Clicca "Create a new function" o "Deploy a new function"
3. Nome: `send-team-invite`
4. Copia e incolla il contenuto di `supabase/functions/send-team-invite/index.ts`
5. Clicca "Deploy"

### Opzione 2: Deploy via CLI

```bash
# Login a Supabase (se non già fatto)
npx supabase login

# Link al progetto
npx supabase link --project-ref mhcdxqhhlrujbjxtgnmz

# Deploy della funzione
npx supabase functions deploy send-team-invite
```

## Verifica Secrets

Assicurati che questi secrets siano configurati in Supabase Dashboard:
- `RESEND_API_KEY` = la tua API key di Resend

I seguenti sono automaticamente disponibili:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Test

1. Vai su TeamFlow
2. Crea un team
3. Aggiungi un giocatore con email e seleziona "Invia invito"
4. Controlla la console per "Invite email sent successfully"
5. Controlla la casella email del destinatario

## Note

- L'email viene inviata da `onboarding@resend.dev` (dominio di test Resend)
- Per usare un dominio personalizzato, configura il dominio in Resend e aggiorna `APP_CONFIG` nella Edge Function
- La funzione supporta sia TeamFlow che FitnessFlow con branding diverso
