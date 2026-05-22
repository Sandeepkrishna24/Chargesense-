import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: { name: string; email: string; photoUrl: string } | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name?: string; photoUrl?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ name: string; email: string; photoUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();
  const supabase = getSupabase();

  const fetchProfile = async (email: string) => {
    // Show saved local values immediately (prevents flash of "Driver")
    const savedName = localStorage.getItem("userName");
    const savedPhoto = localStorage.getItem("userPhotoUrl");
    if (savedName) {
      setProfile(prev => prev
        ? { ...prev, name: savedName, photoUrl: savedPhoto || prev.photoUrl }
        : { name: savedName, email, photoUrl: savedPhoto || "" }
      );
    }

    try {
      const res = await fetch(`/api/user/${email}/profile`);
      if (res.ok) {
        const data = await res.json();

        // Backend (profiles.json) is the source of truth after user edits.
        // Only fall back to localStorage if backend still has the default "Driver" name.
        const resolvedName = (data.name && data.name !== "Driver")
          ? data.name
          : (savedName || data.name || "Driver");
        const resolvedPhoto = data.photoUrl || savedPhoto || "";

        const merged = { ...data, name: resolvedName, photoUrl: resolvedPhoto };
        setProfile(merged);

        // Keep localStorage in sync with backend
        localStorage.setItem("userName", resolvedName);
        if (resolvedPhoto) localStorage.setItem("userPhotoUrl", resolvedPhoto);
      }
    } catch (e) {
      console.error("Profile fetch error:", e);
    }
  };


  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) fetchProfile(email);
  }, []);

  useEffect(() => {
    if (!isConfigured || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [isConfigured, supabase]);

  const signUp = async (email: string, password: string, name?: string) => {
    if (!isConfigured || !supabase) {
      return { error: new Error('Supabase is not configured') };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    if (!isConfigured || !supabase) {
      return { error: new Error('Supabase is not configured') };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      localStorage.setItem('userEmail', email); // ensure email is stored before fetchProfile
      fetchProfile(email);
    }
    return { error: error as Error | null };
  };

  const signOut = async () => {
    localStorage.removeItem('selectedVehicleId');
    localStorage.removeItem('userRange');
    // NOTE: userName & userPhotoUrl intentionally kept so profile restores correctly on next login
    localStorage.removeItem('userEmail');
    localStorage.removeItem('chargingSessions');
    localStorage.removeItem('analyticsData');

    if (isConfigured && supabase) {
      await supabase.auth.signOut();
    }

    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (data: { name?: string; photoUrl?: string }) => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;

    // ✅ Optimistic update — update UI immediately, don't wait for API
    setProfile(prev => prev
      ? { ...prev, ...data }
      : { name: data.name || "User", email, photoUrl: data.photoUrl || "" }
    );

    // Persist to localStorage immediately
    if (data.name) localStorage.setItem("userName", data.name);
    if (data.photoUrl !== undefined) localStorage.setItem("userPhotoUrl", data.photoUrl);

    // Best-effort sync to backend (non-blocking)
    try {
      await fetch(`/api/user/${email}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.error("Profile update sync error (non-fatal):", e);
    }
  };


  const refreshProfile = async () => {
    const email = localStorage.getItem("userEmail");
    if (email) await fetchProfile(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
        isConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
