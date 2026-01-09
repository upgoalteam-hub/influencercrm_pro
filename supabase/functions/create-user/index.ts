import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Parse request body
    const { email, password, fullName, roleId, isActive } = await req.json();

    // Validate required fields
    if (!email || !password || !fullName || !roleId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, fullName, roleId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Wait a moment for the trigger to create the user record
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update the user's role in the users table
    const { data: userData, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        role_id: roleId,
        is_active: isActive !== undefined ? isActive : true
      })
      .eq('email', email)
      .select(`
        *,
        user_roles (
          id,
          role_name,
          display_name,
          permissions
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating user role:', updateError);
      // Don't fail completely - the user was created in auth, just log the error
      console.warn('User created in auth but role update failed:', updateError);
    }

    // If user record doesn't exist yet (trigger didn't fire), create it manually
    if (!userData && authData?.user) {
      const { data: newUserData, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          auth_id: authData.user.id,
          email: email,
          full_name: fullName,
          role_id: roleId,
          is_active: isActive !== undefined ? isActive : true
        })
        .select(`
          *,
          user_roles (
            id,
            role_name,
            display_name,
            permissions
          )
        `)
        .single();

      if (insertError) {
        console.error('Error creating user record:', insertError);
        return new Response(
          JSON.stringify({ error: 'User created in auth but failed to create user record: ' + insertError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data: newUserData }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: userData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

