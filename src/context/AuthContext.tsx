import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, ensureUserProfile, UserProfile } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isSubscribed: boolean;
  isExpired: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  isSubscribed: false,
  isExpired: false
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isSubscribed = profile?.subscriptionStatus === 'active' && 
                      profile?.expiresAt && 
                      (profile.expiresAt.toDate ? profile.expiresAt.toDate() : new Date(profile.expiresAt)) > new Date();

  const isExpired = profile?.subscriptionStatus === 'active' && 
                    profile?.expiresAt && 
                    (profile.expiresAt.toDate ? profile.expiresAt.toDate() : new Date(profile.expiresAt)) <= new Date();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const p = await ensureUserProfile(user);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isSubscribed, isExpired }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
