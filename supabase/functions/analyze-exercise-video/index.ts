/**
 * Supabase Edge Function: Analyze Exercise Video with Gemini AI
 *
 * Analizza video di esercizi usando Google Gemini 1.5 Pro
 * e ritorna feedback tecnico strutturato
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Gemini API endpoint
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { video_url, exercise_name, user_id, correction_id } = await req.json();

    console.log(`[Gemini] Processing video for user ${user_id}, exercise: ${exercise_name}`);

    // 1. Update status → processing
    await supabase
      .from("video_corrections")
      .update({
        processing_status: "processing",
        ai_model_used: "gemini-1.5-pro"
      })
      .eq("id", correction_id);

    // 2. Download video from Supabase Storage
    console.log(`[Gemini] Downloading video from: ${video_url}`);

    const { data: videoBlob, error: downloadError } = await supabase.storage
      .from("user-exercise-videos")
      .download(video_url);

    if (downloadError) {
      throw new Error(`Storage download failed: ${downloadError.message}`);
    }

    // 3. Convert video to base64
    const arrayBuffer = await videoBlob.arrayBuffer();
    const videoBase64 = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    console.log(`[Gemini] Video converted to base64, size: ${videoBase64.length} chars`);

    // 4. Get exercise-specific prompt
    const prompt = getExercisePrompt(exercise_name);

    // 5. Call Gemini API with video
    console.log(`[Gemini] Calling Gemini API...`);

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "video/mp4",
                  data: videoBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4, // Più deterministico per analisi tecnica
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
    }

    const geminiData = await geminiResponse.json();

    console.log(`[Gemini] API response received`);

    // 6. Parse response
    const feedbackText = geminiData.candidates[0].content.parts[0].text;

    // Extract JSON from response (Gemini sometimes wraps in markdown)
    const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in Gemini response");
    }

    const feedback = JSON.parse(jsonMatch[0]);

    console.log(`[Gemini] Feedback parsed, score: ${feedback.overall_score}`);

    // 7. Save feedback to database
    const { error: updateError } = await supabase
      .from("video_corrections")
      .update({
        processing_status: "completed",
        feedback_text: feedbackText,
        feedback_score: feedback.overall_score,
        feedback_issues: feedback.issues || [],
        feedback_corrections: feedback.corrections || [],
        feedback_warnings: feedback.safety_warnings || [],
        load_recommendation: feedback.load_recommendation || "maintain",
        processed_at: new Date().toISOString(),
      })
      .eq("id", correction_id);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    // 8. Increment user quota
    const { error: quotaError } = await supabase.rpc(
      "increment_video_correction_usage",
      { p_user_id: user_id }
    );

    if (quotaError) {
      console.error(`[Gemini] Failed to increment quota: ${quotaError.message}`);
    }

    console.log(`[Gemini] ✅ Processing completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        correction_id,
        feedback: {
          score: feedback.overall_score,
          issues_count: feedback.issues?.length || 0,
          has_warnings: (feedback.safety_warnings?.length || 0) > 0
        }
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

  } catch (error) {
    console.error(`[Gemini] ❌ Error:`, error);

    // Update status to failed
    try {
      await supabase
        .from("video_corrections")
        .update({
          processing_status: "failed",
          metadata: { error: error.message }
        })
        .eq("id", correction_id);
    } catch (e) {
      console.error(`[Gemini] Failed to update error status:`, e);
    }

    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

/**
 * Get exercise-specific prompt for Gemini
 */
function getExercisePrompt(exerciseName: string): string {
  const normalizedName = normalizeExerciseName(exerciseName);

  const basePrompt = `Sei un preparatore atletico esperto con 15 anni di esperienza nell'analisi della tecnica degli esercizi.

Analizza questo video di ${normalizedName} frame-by-frame e fornisci feedback biomeccanico dettagliato IN ITALIANO.

**Focus dell'Analisi:**
1. **Allineamento Articolare** - Verifica allineamento corretto di ginocchia, anche, spalle, colonna
2. **Range of Motion** - Valuta profondità, traiettoria, simmetria del movimento
3. **Tempo e Controllo** - Valuta fasi eccentrica/concentrica, stabilità
4. **Degradazione della Forma** - Identifica le reps dove la tecnica cede
5. **Rischi per la Sicurezza** - Rileva pattern che aumentano il rischio infortuni

${getExerciseSpecificCues(exerciseName)}

**Formato Output:**
Restituisci l'analisi come JSON valido (no markdown, no code blocks):
{
  "overall_score": <numero 1-10>,
  "issues": [
    {
      "name": "<identificatore_problema>",
      "severity": "low|medium|high",
      "description": "<osservazione dettagliata IN ITALIANO>",
      "timestamp_seconds": [<quando accade in secondi>]
    }
  ],
  "corrections": [
    "<cue correttiva specifica e azionabile IN ITALIANO 1>",
    "<cue correttiva specifica e azionabile IN ITALIANO 2>",
    "<cue correttiva specifica e azionabile IN ITALIANO 3>"
  ],
  "safety_warnings": [
    "<avviso se rilevato rischio infortunio IN ITALIANO>"
  ],
  "load_recommendation": "increase_5_percent|maintain|decrease_10_percent|decrease_20_percent"
}

**Linee Guida Punteggio:**
- 9-10: Forma eccellente, solo piccoli affinamenti
- 7-8: Buona forma, alcuni miglioramenti tecnici necessari
- 5-6: Problemi moderati, riduzione carico consigliata
- 3-4: Cedimento significativo della forma, correzioni immediate necessarie
- 1-2: Esecuzione pericolosa, fermarsi e reimparare il movimento

Sii specifico, azionabile e incoraggiante nel feedback. RISPONDI SEMPRE IN ITALIANO.`;

  return basePrompt;
}

/**
 * Normalize exercise name to match cue keys
 * Supports Italian and English variants
 */
function normalizeExerciseName(exerciseName: string): string {
  const name = exerciseName.toLowerCase().trim();

  // SQUAT VARIANTS
  if (name.includes('back squat') || name.includes('squat con bilanciere') ||
      name.includes('squat bilanciere') || name === 'barbell squat') {
    return 'Back Squat';
  }
  if (name.includes('front squat') || name.includes('squat frontale')) {
    return 'Front Squat';
  }
  if (name.includes('goblet squat') || name.includes('squat con kettlebell') ||
      name.includes('squat con manubrio')) {
    return 'Goblet Squat';
  }
  if (name.includes('bulgarian') || name.includes('split squat') ||
      name.includes('affondi bulgari') || name.includes('squat bulgaro')) {
    return 'Bulgarian Split Squat';
  }
  if (name.includes('overhead squat') || name.includes('squat overhead')) {
    return 'Overhead Squat';
  }
  if (name.includes('box squat') || name.includes('squat al box')) {
    return 'Box Squat';
  }
  if (name.includes('squat') && !name.includes('pistol')) {
    return 'Back Squat'; // Default squat
  }
  if (name.includes('pistol') || name.includes('squat a una gamba')) {
    return 'Pistol Squat';
  }

  // BENCH VARIANTS
  if (name.includes('bench press') || name.includes('panca piana') ||
      name.includes('distensioni su panca') || name.includes('panca con bilanciere')) {
    return 'Bench Press';
  }
  if (name.includes('incline') || name.includes('panca inclinata')) {
    return 'Incline Bench Press';
  }

  // DEADLIFT VARIANTS
  if (name.includes('deadlift') && !name.includes('romanian') && !name.includes('rumeno') ||
      name.includes('stacco da terra') || name.includes('stacco classico')) {
    return 'Deadlift';
  }
  if (name.includes('romanian') || name.includes('rdl') || name.includes('stacco rumeno')) {
    return 'Romanian Deadlift';
  }
  if (name.includes('sumo') || name.includes('stacco sumo')) {
    return 'Sumo Deadlift';
  }

  // PRESS VARIANTS
  if (name.includes('overhead press') || name.includes('military press') ||
      name.includes('lento avanti') || name.includes('shoulder press') ||
      name.includes('press sopra la testa')) {
    return 'Overhead Press';
  }

  // PULL VARIANTS
  if (name.includes('pull-up') || name.includes('pullup') || name.includes('trazioni') ||
      name.includes('chin-up') || name.includes('chinup')) {
    return 'Pull-Up';
  }
  if (name.includes('row') || name.includes('rematore') || name.includes('rowing')) {
    return 'Barbell Row';
  }

  // LUNGE VARIANTS
  if (name.includes('lunge') || name.includes('affondo') || name.includes('affondi')) {
    return 'Lunge';
  }

  // HIP HINGE
  if (name.includes('hip thrust') || name.includes('ponte glutei')) {
    return 'Hip Thrust';
  }

  return exerciseName; // Return original if no match
}

/**
 * Exercise-specific technical cues
 */
function getExerciseSpecificCues(exerciseName: string): string {
  const normalizedName = normalizeExerciseName(exerciseName);

  const cues: Record<string, string> = {
    "Back Squat": `
**Back Squat / Squat con Bilanciere - Controlli Specifici:**
- Knee tracking: Verifica valgus (ginocchia verso interno) o varus (verso esterno)
- Colonna lombare: Deve rimanere NEUTRA (no arrotondamento, no iper-estensione)
- Profondità: Cresta iliaca sotto la linea delle ginocchia per parallelo
- Traiettoria bilanciere: Verticale sopra il centro del piede
- Distribuzione peso: Pressione sui talloni, non sulle punte
- Angolo del busto: Costante durante tutto il movimento
- Errori comuni: Ginocchia che cedono, butt wink, inclinazione avanti, talloni che si alzano`,

    "Front Squat": `
**Front Squat / Squat Frontale - Controlli Specifici:**
- Posizione rack: Gomiti ALTI, bilanciere sulle spalle anteriori
- Colonna toracica: Deve rimanere estesa (petto alto)
- Profondità: Può andare più profondo del back squat se la mobilità lo permette
- Knee tracking: Ginocchia in linea con le punte dei piedi
- Core bracing: Addominali contratti per evitare crollo in avanti
- Errori comuni: Gomiti che cadono, busto che crolla avanti, perdita bilanciere`,

    "Goblet Squat": `
**Goblet Squat / Squat con Kettlebell - Controlli Specifici:**
- Posizione peso: Kettlebell/manubrio tenuto al petto, gomiti verso il basso
- Postura: Petto alto, sguardo avanti
- Profondità: Gomiti che toccano l'interno delle ginocchia a fondo squat
- Knee tracking: Ginocchia che seguono la direzione delle punte
- Balance: Peso distribuito su tutto il piede
- Errori comuni: Peso che cade avanti, schiena arrotondata, ginocchia cave`,

    "Bulgarian Split Squat": `
**Bulgarian Split Squat / Affondi Bulgari - Controlli Specifici:**
- Setup: Piede posteriore elevato, tibia anteriore quasi verticale
- Knee tracking: Ginocchio anteriore sopra la caviglia, non oltre le punte
- Torso: Leggera inclinazione avanti OK, ma colonna neutra
- Hip drop: Movimento controllato verso il basso, non in avanti
- Balance: Stabilità durante tutto il movimento
- Errori comuni: Ginocchio anteriore che crolla, troppo peso avanti, instabilità`,

    "Overhead Squat": `
**Overhead Squat - Controlli Specifici:**
- Posizione braccia: Bilanciere sopra la testa, braccia bloccate
- Mobilità spalle: Bilanciere leggermente dietro la testa
- Core stability: Massimo bracing richiesto
- Profondità: Limitata dalla mobilità, non forzare
- Traiettoria: Bilanciere rimane sulla linea del centro del piede
- Errori comuni: Braccia che cedono avanti, perdita equilibrio, busto che crolla`,

    "Box Squat": `
**Box Squat / Squat al Box - Controlli Specifici:**
- Seduta: Sedersi completamente sul box, non toccare e ripartire
- Pausa: Momento di pausa in basso con tensione mantenuta
- Shin angle: Tibie verticali o leggermente inclinate indietro
- Hip drive: Risalita guidata dai glutei
- Controllo eccentrico: Discesa controllata, non cadere sul box
- Errori comuni: Rimbalzare, perdere tensione, tibie troppo avanti`,

    "Pistol Squat": `
**Pistol Squat / Squat a Una Gamba - Controlli Specifici:**
- Balance: Peso centrato sul piede d'appoggio
- Gamba libera: Estesa in avanti, non tocca terra
- Profondità: Gluteo che tocca il tallone (full ROM)
- Controllo: Discesa e risalita controllate, no momentum
- Knee tracking: Ginocchio segue la punta del piede
- Errori comuni: Cadere di lato, ginocchio che crolla, tallone che si alza`,

    "Lunge": `
**Lunge / Affondi - Controlli Specifici:**
- Passo: Lunghezza appropriata (90° entrambe le ginocchia a fondo)
- Knee tracking: Ginocchio anteriore sopra caviglia, non oltre le punte
- Torso: Verticale o leggera inclinazione, non collassato
- Ginocchio posteriore: Sfiora il pavimento senza sbattere
- Balance: Peso distribuito 50/50 o leggermente avanti
- Errori comuni: Passo troppo corto/lungo, ginocchio che crolla, instabilità`,

    "Bench Press": `
**Bench Press / Panca Piana - Controlli Specifici:**
- Angolo gomiti: 45-75° dal busto (NON 90° a T)
- Traiettoria bilanciere: Linea retta verso i capezzoli
- Posizione polsi: Neutri, non piegati indietro
- Posizione spalle: Retratte e depresse per tutto il movimento
- Leg drive: Piedi piantati, usare la spinta delle gambe
- Arco: Arco toracico naturale, non eccessivo a livello lombare
- Errori comuni: Gomiti aperti, bilanciere che rimbalza, glutei che si alzano, polsi che cedono`,

    "Incline Bench Press": `
**Incline Bench Press / Panca Inclinata - Controlli Specifici:**
- Angolo panca: Idealmente 30-45 gradi
- Traiettoria: Bilanciere verso la clavicola
- Setup spalle: Sempre retratte nonostante l'inclinazione
- Gomiti: Angolo 45-60° dal busto
- Arco: Ridotto rispetto alla panca piana
- Errori comuni: Angolo panca troppo alto, spalle che escono, rimbalzo sul petto`,

    "Deadlift": `
**Deadlift / Stacco da Terra - Controlli Specifici:**
- Posizione partenza: Spalle sopra il bilanciere, anche più alte delle ginocchia
- Colonna lombare: NEUTRA per tutta la tirata (sicurezza critica!)
- Traiettoria bilanciere: Linea verticale dritta, vicino a tibie/cosce
- Hip hinge: Anche che vanno indietro, non squattare verso il basso
- Lockout: Estensione completa delle anche, evitare iper-estensione
- Scapole: Sopra o leggermente davanti al bilanciere alla partenza
- Errori comuni: Schiena arrotondata, anche troppo basse, bilanciere che si allontana, hitching`,

    "Sumo Deadlift": `
**Sumo Deadlift / Stacco Sumo - Controlli Specifici:**
- Stance: Piedi larghi, punte verso l'esterno (45-80°)
- Posizione anche: Più basse rispetto allo stacco classico
- Ginocchia: Spinte verso l'esterno, in linea con le punte
- Torso: Più verticale rispetto al conventional
- Presa: Braccia dritte, tra le gambe
- Errori comuni: Ginocchia che cedono dentro, anche che salgono prima delle spalle, perdita posizione`,

    "Overhead Press": `
**Overhead Press / Lento Avanti - Controlli Specifici:**
- Traiettoria: Linea verticale, testa si sposta leggermente indietro
- Core bracing: Addominali contratti, evitare arco lombare eccessivo
- Lockout: Estensione completa braccia, scrollare spalle in alto
- Posizione gomiti: Sotto i polsi durante tutta la spinta
- Posizione anche: Neutra, non spingere in avanti
- Errori comuni: Inclinarsi troppo indietro, bilanciere che va avanti, lockout incompleto`,

    "Pull-Up": `
**Pull-Up / Trazioni alla Sbarra - Controlli Specifici:**
- Posizione partenza: Braccia completamente distese (dead hang)
- Attivazione spalle: Spalle attive, non hang passivo
- Traiettoria trazione: Gomiti verso il basso e indietro, non avanti
- Mento: Chiaramente sopra la sbarra
- Controllo: Eccentrica fluida, no swing/kipping
- Errori comuni: Mezze reps, swing eccessivo, mento non sopra, spalle alzate`,

    "Romanian Deadlift": `
**Romanian Deadlift / Stacco Rumeno - Controlli Specifici:**
- Hip hinge: Anche che vanno indietro, ginocchia leggermente flesse
- Posizione schiena: Colonna neutra mantenuta sempre
- Traiettoria bilanciere: Rimane vicino alle gambe, scende lungo le tibie
- Profondità: Fermarsi quando si sente lo stretch dei femorali, schiena resta piatta
- Lockout: Estensione completa delle anche usando i glutei
- Errori comuni: Movimento di squat, schiena che arrotonda, bilanciere lontano dal corpo, ginocchia troppo piegate`,

    "Barbell Row": `
**Barbell Row / Rematore con Bilanciere - Controlli Specifici:**
- Hip hinge: Busto inclinato 45-60° circa
- Colonna: Neutra, no arrotondamento
- Traiettoria: Bilanciere verso l'ombelico/basso sterno
- Scapole: Retrazione completa in alto
- Gomiti: Vicini al corpo, non larghi
- Errori comuni: Usare momentum, schiena che arrotonda, ROM incompleto, troppo verticali`,

    "Hip Thrust": `
**Hip Thrust / Ponte Glutei - Controlli Specifici:**
- Setup: Scapole appoggiate sulla panca, piedi a terra
- Posizione piedi: Larghezza anche, tibie verticali a fine movimento
- Estensione: Completa estensione delle anche in alto
- Mento: Leggermente verso il petto (sguardo avanti, non in alto)
- Controllo: Pausa in alto, squeeze dei glutei
- Errori comuni: Iper-estensione lombare, piedi troppo avanti/indietro, arco cervicale`,
  };

  return cues[normalizedName] || `
**Analisi Generale Esercizio:**
- Verifica forma corretta e pattern di movimento
- Identifica compensazioni o squilibri
- Valuta controllo e stabilità durante tutto il ROM
- Nota eventuali rischi per la sicurezza o infortuni`;
}
