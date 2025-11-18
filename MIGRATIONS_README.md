# 📊 Database Migrations - FitnessFlow

Questo file contiene tutte le migrations SQL da eseguire su Supabase in ordine.

## 🔧 Setup Iniziale (Fresh Database)

Esegui queste migrations nell'ordine indicato:

### 1. Schema Base + Training Programs
**File**: `supabase_migration.sql`
**Descrizione**: Crea tabella `training_programs` con tutti i campi necessari
**Quando**: Setup iniziale database

```sql
-- Esegui tutto il contenuto di supabase_migration.sql
```

### 2. Analytics System
**File**: `analytics_database_migration.sql`
**Descrizione**: Crea schema `analytics` con star schema (dim/fact/agg tables)
**Quando**: Dopo training_programs

```sql
-- Esegui tutto il contenuto di analytics_database_migration.sql
```

### 3. RPE Auto-Regulation
**File**: `rpe_autoregulation_migration.sql`
**Descrizione**: Sistema RPE tracking e auto-regulation
**Quando**: Dopo analytics

```sql
-- Esegui tutto il contenuto di rpe_autoregulation_migration.sql
```

### 4. Admin System
**File**: `admin_system_migration.sql`
**Descrizione**: Tabella `user_roles` e RLS policies per admin
**Quando**: Dopo RPE

```sql
-- Esegui tutto il contenuto di admin_system_migration.sql
```

### 5. Admin RPC Functions
**File**: `admin_rpc_functions_migration.sql`
**Descrizione**: 6 RPC functions per analytics API
**Quando**: Dopo admin system

```sql
-- Esegui tutto il contenuto di admin_rpc_functions_migration.sql
```

---

## 🐛 Fixes & Patches

### Fix: Goal Constraint
**File**: `fix_goal_constraint.sql`
**Problema**: Constraint CHECK sul campo `goal` rifiutava valori validi
**Quando**: Se ottieni errore "violates check constraint training_programs_goal_check"

```sql
ALTER TABLE training_programs
DROP CONSTRAINT IF EXISTS training_programs_goal_check;
```

**Status**: ✅ Applicato in produzione (2025-01-18)

---

## 📝 Ordine Completo di Esecuzione

Per un fresh setup, esegui in questo ordine:

1. ✅ `supabase_migration.sql`
2. ✅ `analytics_database_migration.sql`
3. ✅ `rpe_autoregulation_migration.sql`
4. ✅ `admin_system_migration.sql`
5. ✅ `admin_rpc_functions_migration.sql`
6. ✅ `fix_goal_constraint.sql` (patch)

---

## 🔍 Come Eseguire

### Via Supabase Dashboard
1. Vai su https://supabase.com/dashboard
2. Seleziona il progetto
3. SQL Editor (icona `</>`)
4. Copia-incolla il contenuto del file
5. Click "Run" (▶️)

### Via CLI (se hai Supabase CLI installato)
```bash
supabase db push
```

---

## ⚠️ Note Importanti

- **RLS Policies**: Le policies sono create automaticamente dalle migrations
- **Indexes**: Gli indici sono creati per performance
- **Constraints**: Alcuni constraint sono stati rimossi per flessibilità
- **First Admin**: Ricordati di creare il primo admin user manualmente dopo admin_system_migration.sql

---

## 🆘 Troubleshooting

### Errore: "relation already exists"
- Normale se esegui migration due volte
- Usa `IF NOT EXISTS` nelle CREATE TABLE

### Errore: "constraint violation"
- Esegui i fix patches (es: fix_goal_constraint.sql)

### Errore: "column not found"
- Verifica di aver eseguito le migrations precedenti

---

## 📚 Documentazione Completa

Per docs complete su ogni sistema:
- Analytics: `ANALYTICS_SYSTEM_README.md`
- RPE: `RPE_AUTOREGULATION_README.md`
- Admin: Vedi commenti in `admin_system_migration.sql`
