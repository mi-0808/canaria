import { createBrowserClient } from "@supabase/ssr";

// ponytail: browser client only. Add server client + proxy when auth lands.
export const createClient = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
