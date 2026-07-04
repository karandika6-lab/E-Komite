import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Note: This client should ONLY be used in secure environments (Server Actions, API Routes)
// NEVER expose the service role key to the client side.
export const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
