import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Probe = {
  id: number
  text: string
  name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}