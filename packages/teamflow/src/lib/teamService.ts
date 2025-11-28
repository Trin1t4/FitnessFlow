/**
 * Team Service - Gestione Squadre e Giocatori
 */
import { supabase } from './supabaseClient';
import type { Team, TeamMember, CreateTeamForm, AddPlayerForm } from '@/types';

// ============================================
// TEAMS
// ============================================

export async function createTeam(data: CreateTeamForm, userId: string): Promise<Team> {
  const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const { data: team, error } = await supabase
    .from('teams')
    .insert({
      name: data.name,
      slug: `${slug}-${Date.now()}`,
      sport: data.sport,
      category: data.category || null,
      created_by: userId,
      subscription_status: 'trial',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 giorni
    })
    .select()
    .single();

  if (error) throw error;

  // Aggiungi il creatore come owner
  await supabase.from('team_members').insert({
    team_id: team.id,
    user_id: userId,
    role: 'owner',
    status: 'active',
  });

  return team;
}

export async function getTeam(teamId: string): Promise<Team | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (error) return null;
  return data;
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('team_id, role, teams(*)')
    .eq('user_id', userId);

  if (error) return [];
  return data.map((m: { teams: Team }) => m.teams).filter(Boolean);
}

export async function getCoachTeams(userId: string): Promise<Team[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('team_id, role, teams(*)')
    .eq('user_id', userId)
    .in('role', ['owner', 'coach']);

  if (error) return [];
  return data.map((m: { teams: Team }) => m.teams).filter(Boolean);
}

export async function updateTeam(teamId: string, updates: Partial<Team>): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', teamId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// TEAM MEMBERS
// ============================================

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      *,
      user:auth.users(email, raw_user_meta_data)
    `)
    .eq('team_id', teamId)
    .order('role', { ascending: true })
    .order('jersey_number', { ascending: true });

  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
  return data || [];
}

export async function getTeamAthletes(teamId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId)
    .eq('role', 'athlete')
    .order('jersey_number', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function addPlayerToTeam(teamId: string, playerData: AddPlayerForm, invitedBy: string): Promise<{ member?: TeamMember; invite?: { token: string } }> {
  if (playerData.send_invite) {
    // Crea un invito che verrà accettato dal giocatore
    const { data: invite, error } = await supabase
      .from('team_invites')
      .insert({
        team_id: teamId,
        email: playerData.email,
        role: 'athlete',
        jersey_number: playerData.jersey_number,
        position: playerData.position,
        invited_by: invitedBy,
      })
      .select()
      .single();

    if (error) throw error;
    return { invite: { token: invite.invite_token } };
  } else {
    // Crea direttamente un membro senza account (gestito dal coach)
    // Questo crea un "placeholder" che verrà collegato quando il giocatore si registra
    const { data: member, error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: invitedBy, // Temporaneamente associato al coach
        role: 'athlete',
        jersey_number: playerData.jersey_number,
        position: playerData.position,
        status: 'pending',
        invited_by: invitedBy,
      })
      .select()
      .single();

    if (error) throw error;
    return { member };
  }
}

export async function updateTeamMember(memberId: string, updates: Partial<TeamMember>): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .update(updates)
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeTeamMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
}

// ============================================
// INVITES
// ============================================

export async function acceptTeamInvite(token: string, userId: string): Promise<Team | null> {
  // Trova l'invito
  const { data: invite, error: inviteError } = await supabase
    .from('team_invites')
    .select('*')
    .eq('invite_token', token)
    .eq('status', 'pending')
    .single();

  if (inviteError || !invite) return null;

  // Verifica che non sia scaduto
  if (new Date(invite.expires_at) < new Date()) {
    await supabase
      .from('team_invites')
      .update({ status: 'expired' })
      .eq('id', invite.id);
    return null;
  }

  // Aggiungi il membro
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: invite.team_id,
      user_id: userId,
      role: invite.role,
      jersey_number: invite.jersey_number,
      position: invite.position,
      status: 'active',
      invited_by: invite.invited_by,
      invite_accepted_at: new Date().toISOString(),
    });

  if (memberError) throw memberError;

  // Aggiorna l'invito
  await supabase
    .from('team_invites')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      accepted_by: userId,
    })
    .eq('id', invite.id);

  // Ritorna il team
  return getTeam(invite.team_id);
}

export async function getPendingInvites(teamId: string): Promise<{ email: string; role: string; created_at: string }[]> {
  const { data, error } = await supabase
    .from('team_invites')
    .select('email, role, created_at')
    .eq('team_id', teamId)
    .eq('status', 'pending');

  if (error) return [];
  return data || [];
}

// ============================================
// USER ROLE CHECK
// ============================================

export async function getUserTeamRole(teamId: string, userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data?.role || null;
}

export async function isTeamCoach(teamId: string, userId: string): Promise<boolean> {
  const role = await getUserTeamRole(teamId, userId);
  return role === 'owner' || role === 'coach';
}

// ============================================
// SPORT POSITIONS
// ============================================

export async function getSportPositions(sport: string): Promise<{ key: string; name: string; category: string }[]> {
  const { data, error } = await supabase
    .from('sport_positions')
    .select('position_key, position_name_it, category')
    .eq('sport', sport);

  if (error) return [];
  return (data || []).map((p: { position_key: string; position_name_it: string; category: string }) => ({
    key: p.position_key,
    name: p.position_name_it,
    category: p.category,
  }));
}
