import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  skills: string[]
  location: [number, number] | null
  education: EducationEntry[]
  created_at: string
  updated_at: string
}

export interface EducationEntry {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  startYear: string
  endYear: string
}

class UserProfileService {
  async checkTableExists(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      return !error
    } catch (error) {
      console.log('Table check failed:', error)
      return false
    }
  }

  async createTable(): Promise<boolean> {
    try {
      const sql = `
        -- Create profiles table
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
      `

      const { error } = await supabase.rpc('exec_sql', { sql })
      
      if (error) {
        console.error('Error creating table:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error creating table:', error)
      return false
    }
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Check if table exists first
      const tableExists = await this.checkTableExists()
      if (!tableExists) {
        console.log('Profiles table does not exist, returning fallback profile')
        return this.createFallbackProfile(userId)
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error.message || error)
        console.error('Full error object:', JSON.stringify(error, null, 2))
        
        // If table doesn't exist, return fallback
        if (error.code === 'PGRST205') {
          return this.createFallbackProfile(userId)
        }
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      return null
    }
  }

  async createProfile(user: User, profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      // Check if table exists first
      const tableExists = await this.checkTableExists()
      if (!tableExists) {
        console.log('Profiles table does not exist, using fallback profile')
        return this.createFallbackProfile(user.id, profileData)
      }

      const defaultProfile = {
        id: user.id,
        email: user.email!,
        full_name: profileData.full_name || user.user_metadata?.full_name || null,
        avatar_url: profileData.avatar_url || null,
        bio: profileData.bio || null,
        skills: profileData.skills || [],
        location: profileData.location || null,
        education: profileData.education || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([defaultProfile])
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error.message || error)
        console.error('Full error object:', JSON.stringify(error, null, 2))
        
        // If table doesn't exist, return fallback
        if (error.code === 'PGRST205') {
          return this.createFallbackProfile(user.id, profileData)
        }
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating profile:', error)
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      return null
    }
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      // Check if table exists first
      const tableExists = await this.checkTableExists()
      if (!tableExists) {
        console.log('Profiles table does not exist, cannot update profile')
        return null
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error.message || error)
        console.error('Full error object:', JSON.stringify(error, null, 2))
        return null
      }

      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      return null
    }
  }

  async getOrCreateProfile(user: User): Promise<UserProfile | null> {
    // First try to get existing profile
    let profile = await this.getProfile(user.id)
    
    if (!profile) {
      // Create profile if it doesn't exist
      profile = await this.createProfile(user, {
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
      })
    }

    return profile
  }

  private createFallbackProfile(userId: string, profileData?: Partial<UserProfile>): UserProfile {
    return {
      id: userId,
      email: profileData?.email || 'user@example.com',
      full_name: profileData?.full_name || 'User',
      avatar_url: profileData?.avatar_url || null,
      bio: profileData?.bio || null,
      skills: profileData?.skills || [],
      location: profileData?.location || null,
      education: profileData?.education || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
}

export const userProfileService = new UserProfileService()
