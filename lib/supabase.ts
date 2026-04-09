import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon, {
  realtime: { params: { eventsPerSecond: 10 } },
});

export type Session = {
  id: string;
  slug: string;
  title: string | null;
  host_code: string;
  created_at: string;
};

export type Action = {
  id: string;
  session_id: string;
  text: string;
  created_at: string;
};
