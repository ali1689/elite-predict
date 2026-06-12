import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://pekulnmfxyxqyusnhhfn.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBla3Vsbm1meHl4cXl1c25oaGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzgxODksImV4cCI6MjA5MzQxNDE4OX0.rm_RmYSCLrbbrtKHTuNlGpT4evO1iRGci_bdqK8WL4Y";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);