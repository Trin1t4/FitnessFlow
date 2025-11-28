/**
 * Team Types - Gestione Squadre e Allenatori
 */

// Modalità utente
export type UserMode = 'individual' | 'team';
export type TeamRole = 'coach' | 'player';

// Team/Squadra
export interface Team {
  id: string;
  name: string;
  sport: string;
  category?: string; // es. "Under 18", "Prima Squadra"
  coach_id: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

// Membro squadra (giocatore)
export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string | null; // null se account creato dal coach ma non ancora attivo
  email: string;
  first_name: string;
  last_name: string;
  jersey_number?: number;
  position?: string; // es. "Portiere", "Ala", "Centro"
  birth_date?: string;
  role: TeamRole;
  status: 'pending' | 'active' | 'inactive';
  invite_token?: string;
  invite_expires_at?: string;
  joined_at?: string;
  created_at: string;
  updated_at: string;
}

// Dati giocatore inseriti dal coach (screening, test, misurazioni)
export interface PlayerData {
  id: string;
  team_member_id: string;
  data_type: 'screening' | 'assessment' | 'measurement' | 'note';
  data: Record<string, unknown>;
  recorded_by: string; // coach user_id
  recorded_at: string;
  created_at: string;
}

// Programma assegnato dal coach
export interface TeamProgram {
  id: string;
  team_id: string;
  program_id: string;
  assigned_to: string[]; // team_member_ids - vuoto = tutta la squadra
  assigned_by: string; // coach user_id
  start_date?: string;
  end_date?: string;
  notes?: string;
  created_at: string;
}

// Invito squadra
export interface TeamInvite {
  id: string;
  team_id: string;
  email: string;
  role: TeamRole;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

// Form creazione squadra
export interface CreateTeamForm {
  name: string;
  sport: string;
  category?: string;
}

// Form aggiunta giocatore
export interface AddPlayerForm {
  email: string;
  first_name: string;
  last_name: string;
  jersey_number?: number;
  position?: string;
  birth_date?: string;
  send_invite: boolean; // true = invia email invito, false = crea profilo senza invito
}

// Stato selezione modalità (store)
export interface ModeSelectionState {
  mode: UserMode | null;
  teamRole?: TeamRole;
  selectedTeamId?: string;
}
