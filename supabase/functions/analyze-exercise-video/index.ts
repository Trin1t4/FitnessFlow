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
  const basePrompt = `You are an expert strength and conditioning coach with 15 years of experience analyzing exercise technique.

Analyze this ${exerciseName} video frame-by-frame and provide detailed biomechanical feedback.

**Analysis Focus:**
1. **Joint Alignment** - Check proper alignment of knees, hips, shoulders, spine
2. **Range of Motion** - Evaluate depth, bar path, movement symmetry
3. **Tempo & Control** - Assess eccentric/concentric phases, stability
4. **Form Degradation** - Identify reps where technique breaks down
5. **Safety Risks** - Detect injury risk patterns

${getExerciseSpecificCues(exerciseName)}

**Output Format:**
Return your analysis as valid JSON (no markdown, no code blocks):
{
  "overall_score": <number 1-10>,
  "issues": [
    {
      "name": "<issue_identifier>",
      "severity": "low|medium|high",
      "description": "<detailed observation>",
      "timestamp_seconds": [<when it occurs>]
    }
  ],
  "corrections": [
    "<specific actionable cue 1>",
    "<specific actionable cue 2>",
    "<specific actionable cue 3>"
  ],
  "safety_warnings": [
    "<warning if injury risk detected>"
  ],
  "load_recommendation": "increase_5_percent|maintain|decrease_10_percent|decrease_20_percent"
}

**Scoring Guidelines:**
- 9-10: Excellent form, minor refinements only
- 7-8: Good form, some technical improvements needed
- 5-6: Moderate issues, load reduction recommended
- 3-4: Significant form breakdown, immediate corrections needed
- 1-2: Dangerous execution, stop and relearn movement

Be specific, actionable, and encouraging in your feedback.`;

  return basePrompt;
}

/**
 * Exercise-specific technical cues
 */
function getExerciseSpecificCues(exerciseName: string): string {
  const cues: Record<string, string> = {
    "Back Squat": `
**Back Squat Specific Checks:**
- Knee tracking: Check for valgus (inward collapse) or varus (outward bow)
- Lumbar spine: Must stay neutral (no rounding or hyperextension)
- Depth: Hip crease below knee line for parallel, assess if safe
- Bar path: Should be vertical over midfoot
- Weight distribution: Pressure through heels, not toes
- Torso angle: Consistent throughout movement
- Common errors: Knees caving, butt wink, forward lean, heel lift`,

    "Bench Press": `
**Bench Press Specific Checks:**
- Elbow angle: 45-75° from torso (not 90° flare)
- Bar path: Straight line to nipple area, not too high
- Wrist position: Neutral, not bent back
- Shoulder position: Retracted and depressed throughout
- Leg drive: Feet planted, using leg drive effectively
- Arch: Natural thoracic arch, not excessive lumbar
- Common errors: Elbows flared, bar bouncing, butt lift, wrists collapsing`,

    "Deadlift": `
**Deadlift Specific Checks:**
- Starting position: Shoulders over bar, hips higher than knees
- Lumbar spine: Neutral throughout entire pull (critical safety)
- Bar path: Straight vertical line, close to shins/thighs
- Hip hinge: Moving hips back, not squatting down
- Lockout: Full hip extension, avoid overextending back
- Shoulder blades: Over or slightly in front of bar at start
- Common errors: Rounded back, hips too low, bar drifting away, hitching`,

    "Overhead Press": `
**Overhead Press Specific Checks:**
- Bar path: Vertical line, head moves back slightly
- Core bracing: Tight abs, avoid excessive back arch
- Lockout: Full arm extension, shrug shoulders at top
- Elbow position: Under wrists throughout press
- Hip position: Neutral, not thrusting forward
- Common errors: Leaning back too much, bar drifting forward, incomplete lockout`,

    "Pull-Up": `
**Pull-Up Specific Checks:**
- Starting position: Full arm extension (dead hang)
- Shoulder engagement: Active shoulders, not passive hang
- Pull path: Pull elbows down and back, not forward
- Chin clearance: Chin clearly over bar
- Control: Smooth eccentric, no swinging/kipping
- Common errors: Half reps, excessive swing, chin not over bar, shrugged shoulders`,

    "Romanian Deadlift": `
**Romanian Deadlift Specific Checks:**
- Hip hinge: Hips move back, knees slightly bent
- Back position: Neutral spine maintained throughout
- Bar path: Stays close to legs, travels down shins
- Depth: Stop when hamstring stretch felt, back stays flat
- Lockout: Full hip extension using glutes
- Common errors: Squatting motion, back rounding, bar too far from body, knees too bent`,
  };

  return cues[exerciseName] || `
**General Exercise Analysis:**
- Check for proper form and movement pattern
- Identify any compensations or imbalances
- Assess control and stability throughout range of motion
- Note any safety concerns or injury risks`;
}
