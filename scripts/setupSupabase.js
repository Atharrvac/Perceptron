// Quick script to check Supabase connection and setup
import { supabase } from '../services/supabase.ts'

async function checkSupabase() {
  try {
    console.log('🔍 Checking Supabase connection...')
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Connection/Table Error:', connectionError.message)
      
      if (connectionError.message.includes('relation "public.profiles" does not exist')) {
        console.log('\n📋 The profiles table needs to be created!')
        console.log('🔧 Please run the SQL from supabase_setup.sql in your Supabase dashboard')
        console.log('👉 Go to: Supabase Dashboard > SQL Editor > New Query')
        console.log('📄 Copy and paste the content from supabase_setup.sql')
        return false
      }
    } else {
      console.log('✅ Supabase connection and profiles table working!')
      return true
    }
  } catch (error) {
    console.error('🚨 Unexpected error:', error)
    return false
  }
}

checkSupabase()
