import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const { phone, newPassword } = await request.json();

    if (!phone || !newPassword) {
      return NextResponse.json(
        { error: 'Phone number and new password are required.' },
        { status: 400 }
      );
    }

    const email = `${phone.trim()}@equraishi.com`;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Check if the service role key is configured. If not, simulate success for development mode.
    if (!serviceRoleKey) {
      console.warn(
        `[DEV MODE] SUPABASE_SERVICE_ROLE_KEY is not defined in .env.local. Simulating password reset to "${newPassword}" for user "${email}".`
      );
      return NextResponse.json({
        success: true,
        message: 'Password reset simulated successfully (Development Mode).',
        simulated: true,
      });
    }

    // Initialize Supabase Admin Client using service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log(`[API Route] Sourcing user for email: ${email}`);

    // Fetch users list to find the matching user ID
    // Note: pagination details are bypassed since the list is normally small in early stages, 
    // or we can retrieve it.
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('[API Route] Error listing users:', listError);
      return NextResponse.json(
        { error: 'Failed to access authentication records.' },
        { status: 500 }
      );
    }

    const user = users.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: 'No account registered with this phone number.' },
        { status: 404 }
      );
    }

    // Update the user's password directly in Supabase
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('[API Route] Error updating user password:', updateError);
      return NextResponse.json(
        { error: updateError.message || 'Failed to update password.' },
        { status: 500 }
      );
    }

    console.log(`[API Route] Password successfully updated for user ${user.id} (${email})`);

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully.',
      simulated: false,
    });
  } catch (err) {
    console.error('[API Route] Exception inside reset-password route:', err);
    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
