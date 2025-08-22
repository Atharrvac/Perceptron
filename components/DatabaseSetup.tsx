import React, { useState } from 'react'
import { supabase } from '../services/supabase'

const DatabaseSetup: React.FC = () => {
  const [checking, setChecking] = useState(false)
  const [status, setStatus] = useState<'unknown' | 'exists' | 'missing'>('unknown')
  const [error, setError] = useState<string | null>(null)

  const checkTable = async () => {
    setChecking(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (error) {
        if (error.message.includes('relation "public.profiles" does not exist')) {
          setStatus('missing')
        } else {
          setError(error.message)
        }
      } else {
        setStatus('exists')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setChecking(false)
    }
  }

  const copySQL = () => {
    const sql = `-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  location POINT,
  education JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();`

    navigator.clipboard.writeText(sql).then(() => {
      alert('SQL copied to clipboard! Now paste it in your Supabase SQL Editor.')
    }).catch(() => {
      alert('Could not copy to clipboard. Please manually copy the SQL from the supabase_setup.sql file.')
    })
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-600">
      <h3 className="text-xl font-semibold text-teal-400 mb-4">Database Setup Required</h3>
      
      <div className="mb-4">
        <button
          onClick={checkTable}
          disabled={checking}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors mr-4"
        >
          {checking ? 'Checking...' : 'Check Database Status'}
        </button>
        
        {status === 'exists' && (
          <span className="text-green-400">✅ Database table exists!</span>
        )}
        
        {status === 'missing' && (
          <span className="text-red-400">❌ Profiles table missing</span>
        )}
        
        {error && (
          <span className="text-red-400">❌ Error: {error}</span>
        )}
      </div>

      {status === 'missing' && (
        <div className="bg-slate-700 p-4 rounded-md">
          <h4 className="font-semibold text-slate-200 mb-2">Setup Instructions:</h4>
          <ol className="text-sm text-slate-300 space-y-2 mb-4 list-decimal list-inside">
            <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300">Supabase Dashboard</a></li>
            <li>Navigate to SQL Editor</li>
            <li>Click "New Query"</li>
            <li>Click the button below to copy the SQL</li>
            <li>Paste the SQL and run it</li>
            <li>Come back and click "Check Database Status"</li>
          </ol>
          
          <button
            onClick={copySQL}
            className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-md transition-colors"
          >
            📋 Copy Setup SQL
          </button>
        </div>
      )}
    </div>
  )
}

export default DatabaseSetup
