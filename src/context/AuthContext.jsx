'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({
  user: null,
  session: null,
  profile: null,
  loading: true,
  authModalOpen: false,
  setAuthModalOpen: () => {},
  signInWithPassword: async (email, password) => {},
  signUpWithPassword: async (email, password, fullName) => {},
  sendPasswordResetEmail: async (email) => {},
  signOut: async () => {},
  updateProfileName: async (name) => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Sync and fetch profile details from DB
  const fetchProfile = async (userId, userEmail, metaName) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Record not found - insert safety profile
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail,
            full_name: metaName || 'Guest User',
            role: 'customer' // default customer role
          })
          .select()
          .single();
        
        if (!insertError) {
          setProfile(newProfile);
        }
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser) {
        await fetchProfile(
          activeUser.id, 
          activeUser.email, 
          activeUser.user_metadata?.full_name || activeUser.user_metadata?.name
        );
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      
      if (activeUser) {
        await fetchProfile(
          activeUser.id, 
          activeUser.email, 
          activeUser.user_metadata?.full_name || activeUser.user_metadata?.name
        );
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUpWithPassword = async (email, password, fullName) => {
    console.log('[AuthContext] signUpWithPassword initiating for email:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'customer' // default role
        },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/account` : undefined,
      }
    });

    console.log('[AuthContext] signUp raw data response:', data);
    console.log('[AuthContext] signUp raw error response:', error);

    if (error) {
      console.error('[AuthContext] signUp returned a direct error:', error);
      throw error;
    }

    if (data?.user) {
      console.log('[AuthContext] signUp User identities list:', data.user.identities);
      console.log('[AuthContext] signUp User identities length:', data.user.identities?.length);
      
      const isDuplicate = !data.user.identities || data.user.identities.length === 0;
      console.log('[AuthContext] signUp Is duplicate check evaluated to:', isDuplicate);

      if (isDuplicate) {
        console.warn('[AuthContext] signUp: Empty identities detected. Throwing duplicate user error.');
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }
    }

    return data;
  };

  const sendPasswordResetEmail = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
    setSession(null);
    localStorage.removeItem('al_quraish_user');
  };

  const updateProfileName = async (fullName) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    setProfile(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      authModalOpen,
      setAuthModalOpen,
      signInWithPassword,
      signUpWithPassword,
      sendPasswordResetEmail,
      signOut,
      updateProfileName
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
