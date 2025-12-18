// Supabase Edge Function: Send Team Invite Email
// Triggered when a new team_invite is created
// Supports both TeamFlow and TrainSmart apps

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// App configurations
const APP_CONFIG = {
  teamflow: {
    name: 'TeamFlow',
    tagline: 'Preparazione Atletica per Squadre',
    url: 'https://teamflow-brown.vercel.app',
    primaryColor: '#f97316', // orange
    gradientFrom: '#f97316',
    gradientTo: '#ea580c',
    fromEmail: 'TeamFlow <onboarding@resend.dev>', // Usa resend.dev per test, poi cambia con dominio verificato
  },
  trainsmart: {
    name: 'TrainSmart',
    tagline: 'Il tuo Personal Trainer AI',
    url: 'https://trainsmart.me',
    primaryColor: '#10b981', // emerald
    gradientFrom: '#10b981',
    gradientTo: '#059669',
    fromEmail: 'TrainSmart <onboarding@resend.dev>', // Usa resend.dev per test
  }
}

interface TeamInvitePayload {
  type: 'INSERT'
  table: 'team_invites'
  record: {
    id: string
    team_id: string
    email: string
    role: string
    invite_token: string
    invited_by: string
    position?: string
    jersey_number?: number
    source_app?: 'teamflow' | 'trainsmart' // Per distinguere le app
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: TeamInvitePayload = await req.json()

    // Only process INSERT events
    if (payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Not an INSERT event' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const { record } = payload
    const { email, invite_token, team_id, role, position, jersey_number, invited_by, source_app } = record

    // Determina quale app sta inviando (default: teamflow per retrocompatibilità)
    const appKey = source_app || 'teamflow'
    const app = APP_CONFIG[appKey] || APP_CONFIG.teamflow

    // Create Supabase client to fetch additional data
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get team info
    const { data: team } = await supabase
      .from('teams')
      .select('name, sport')
      .eq('id', team_id)
      .single()

    // Get inviter info
    const { data: inviter } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('user_id', invited_by)
      .single()

    const teamName = team?.name || 'Una squadra'
    const sportName = team?.sport || 'sport'
    const inviterName = inviter ? `${inviter.first_name} ${inviter.last_name}` : 'Il coach'

    // Build invite URL (dinamico per app)
    const inviteUrl = `${app.url}/invite/${invite_token}`

    // Build email HTML (con branding dinamico per app)
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invito ${app.name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${app.gradientFrom} 0%, ${app.gradientTo} 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">${app.name}</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">${app.tagline}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #f1f5f9; font-size: 24px; font-weight: 600;">
                Sei stato invitato!
              </h2>

              <p style="margin: 0 0 24px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                <strong style="color: #f1f5f9;">${inviterName}</strong> ti ha invitato a unirti alla squadra
                <strong style="color: ${app.primaryColor};">${teamName}</strong> su ${app.name}.
              </p>

              ${position || jersey_number ? `
              <div style="background-color: #334155; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; color: #94a3b8; font-size: 14px;">
                  ${position ? `<span style="color: #f1f5f9;">Ruolo:</span> ${position}<br>` : ''}
                  ${jersey_number ? `<span style="color: #f1f5f9;">Numero:</span> #${jersey_number}` : ''}
                </p>
              </div>
              ` : ''}

              <p style="margin: 0 0 32px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                Clicca il pulsante qui sotto per accettare l'invito e iniziare il tuo percorso di allenamento personalizzato.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${inviteUrl}"
                       style="display: inline-block; background: linear-gradient(135deg, ${app.gradientFrom} 0%, ${app.gradientTo} 100%);
                              color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px;
                              font-size: 16px; font-weight: 600;">
                      Accetta Invito
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; color: #64748b; font-size: 14px; text-align: center;">
                Oppure copia questo link nel browser:<br>
                <a href="${inviteUrl}" style="color: ${app.primaryColor}; word-break: break-all;">${inviteUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                Questa email e stata inviata da ${app.name}.<br>
                Se non ti aspettavi questo invito, puoi ignorare questa email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: app.fromEmail,
        to: [email],
        subject: `${inviterName} ti ha invitato a ${teamName} su ${app.name}`,
        html: emailHtml,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend error:', resendData)
      throw new Error(resendData.message || 'Failed to send email')
    }

    console.log('Email sent successfully:', resendData)

    return new Response(
      JSON.stringify({ success: true, emailId: resendData.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
