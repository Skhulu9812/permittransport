import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://skadcgkhizimzasqgnca.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYWRjZ2toaXppbXphc3FnbmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNjk1NjMsImV4cCI6MjA4NDY0NTU2M30.MeUhbVp4UVr6geoLOl9YdWfrGeJSlaUtJK2lU2RucOQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);