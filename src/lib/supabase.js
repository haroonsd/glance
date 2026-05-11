import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocdrqmaalkuxplbpfnio.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZHJxbWFhbGt1eHBsYnBmbmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNjEzNjUsImV4cCI6MjA4OTYzNzM2NX0.ki0LMGnXOPxKoU2VJCzcY5SGMlhOMP_Dphp6ZUggp-I'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})