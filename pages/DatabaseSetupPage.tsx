import React, { useState } from 'react'
import { userProfileService } from '../services/userProfileService'

const DatabaseSetupPage: React.FC = () => {
  const [checking, setChecking] = useState(false)
  const [creating, setCreating] = useState(false)
  const [status, setStatus] = useState<'unknown' | 'exists' | 'missing' | 'created'>('unknown')
  const [error, setError] = useState<string | null>(null)

  const checkTable = async () => {
    setChecking(true)
    setError(null)
    
    try {
      const exists = await userProfileService.checkTableExists()
      setStatus(exists ? 'exists' : 'missing')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setChecking(false)
    }
  }

  const createTable = async () => {
    setCreating(true)
    setError(null)
    
    try {
      const success = await userProfileService.createTable()
      if (success) {
        setStatus('created')
      } else {
        setError('Failed to create table. Please use manual setup.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setCreating(false)
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
      alert('Could not copy to clipboard. Please manually copy the SQL from below.')
    })
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-teal-400 mb-2">Database Setup</h1>
          <p className="text-slate-400">Set up the profiles table in your Supabase database</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
          {/* Status Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-teal-400 mb-4">Database Status</h2>
            
            <div className="space-y-4">
              <button
                onClick={checkTable}
                disabled={checking}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {checking ? 'Checking...' : 'Check Table Status'}
              </button>
              
              {status === 'exists' && (
                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-md">
                  <p className="text-green-400">✅ Profiles table exists! You can now use the app.</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Continue to App
                  </button>
                </div>
              )}
              
              {status === 'created' && (
                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-md">
                  <p className="text-green-400">✅ Table created successfully!</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Continue to App
                  </button>
                </div>
              )}
              
              {status === 'missing' && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-md">
                  <p className="text-red-400">❌ Profiles table missing</p>
                </div>
              )}
              
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-md">
                  <p className="text-red-400">❌ Error: {error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Setup Options */}
          {status === 'missing' && (
            <div className="space-y-6">
              {/* Option 1: Automatic */}
              <div className="bg-slate-700 p-4 rounded-md">
                <h3 className="font-semibold text-slate-200 mb-2">Option 1: Automatic Setup (Try First)</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Attempt to create the table automatically through the API.
                </p>
                <button
                  onClick={createTable}
                  disabled={creating}
                  className="bg-teal-600 hover:bg-teal-500 disabled:bg-teal-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  {creating ? 'Creating Table...' : 'Create Table Automatically'}
                </button>
              </div>

              {/* Option 2: Manual */}
              <div className="bg-slate-700 p-4 rounded-md">
                <h3 className="font-semibold text-slate-200 mb-2">Option 2: Manual Setup</h3>
                <p className="text-sm text-slate-400 mb-3">
                  If automatic setup fails, copy the SQL and run it manually in your Supabase dashboard.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={copySQL}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    📋 Copy SQL to Clipboard
                  </button>
                  
                  <div className="text-xs text-slate-400 space-y-1">
                    <p><strong>Manual Steps:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Copy the SQL above</li>
                      <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300">Supabase Dashboard</a></li>
                      <li>Navigate to SQL Editor</li>
                      <li>Click "New Query"</li>
                      <li>Paste the SQL and run it</li>
                      <li>Come back and click "Check Table Status"</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DatabaseSetupPage
