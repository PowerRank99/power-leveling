
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find Pierri Bruno's user ID
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('name', 'Pierri Bruno')
      .single()

    if (userError || !userProfile) {
      return new Response(JSON.stringify({ error: 'User not found', details: userError }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }

    // Find the last workout with the specific title
    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .select('id, started_at')
      .eq('user_id', userProfile.id)
      .order('started_at', { ascending: false })
      .limit(1)

    if (workoutError || !workoutData.length) {
      return new Response(JSON.stringify({ error: 'No workouts found', details: workoutError }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }

    // Get personal records for this workout
    const { data: personalRecords, error: prError } = await supabase.rpc(
      'get_personal_records_for_workout', 
      { 
        p_workout_id: workoutData[0].id, 
        p_user_id: userProfile.id 
      }
    )

    return new Response(JSON.stringify({
      user: userProfile.id,
      workout: workoutData[0],
      personalRecords: personalRecords || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
