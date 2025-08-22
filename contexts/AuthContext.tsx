import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import { userProfileService, UserProfile } from '../services/userProfileService'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  signUp: (email: string, password: string, userData?: any) => Promise<{ user: User | null; error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>
  loading: boolean
  profileLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  // Check if Supabase is properly configured
  const isConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user && isConfigured) {
        // Load or create user profile
        setProfileLoading(true)
        const userProfile = await userProfileService.getOrCreateProfile(session.user)
        setProfile(userProfile)
        setProfileLoading(false)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData?: any) => {
    if (!isConfigured) {
      return {
        user: null,
        error: { message: 'Supabase is not configured. Please set your environment variables.' } as AuthError
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { user: data.user, error }
  }

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      return {
        user: null,
        error: { message: 'Supabase is not configured. Please set your environment variables.' } as AuthError
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { user: data.user, error }
  }

  const signOut = async () => {
    if (!isConfigured) {
      return { error: { message: 'Supabase is not configured.' } as AuthError }
    }

    const { error } = await supabase.auth.signOut()
    setProfile(null)
    return { error }
  }

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!user || !isConfigured) return null

    const updatedProfile = await userProfileService.updateProfile(user.id, updates)
    if (updatedProfile) {
      setProfile(updatedProfile)
    }
    return updatedProfile
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    signUp,
    signIn,
    signOut,
    updateProfile,
    loading,
    profileLoading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
