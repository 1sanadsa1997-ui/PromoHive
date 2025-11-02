import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'ibrahim-accounting-system'
    }
  }
})

// Helper function to get current user's store_id
export const getCurrentStoreId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('users')
    .select('store_id')
    .eq('id', user.id)
    .single()
  
  return profile?.store_id || null
}

// Helper function to check subscription status
export const checkSubscriptionStatus = async (storeId) => {
  if (!storeId) return { isActive: false, daysLeft: 0 }
  
  const { data: store } = await supabase
    .from('stores')
    .select('subscription_end_date, subscription_status')
    .eq('id', storeId)
    .single()
  
  if (!store) return { isActive: false, daysLeft: 0 }
  
  const endDate = new Date(store.subscription_end_date)
  const today = new Date()
  const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
  
  return {
    isActive: store.subscription_status === 'active' && daysLeft > 0,
    daysLeft: Math.max(0, daysLeft),
    status: store.subscription_status
  }
}

// Row Level Security helper
export const enableRLS = async () => {
  // This will be handled in SQL migrations
  console.log('RLS should be enabled via SQL migrations')
}

export default supabase
