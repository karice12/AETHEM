import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, ensureUserProfile, UserProfile, db } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isSubscribed: boolean;
  isExpired: boolean;
  needsTermsAcceptance: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  isSubscribed: false,
  isExpired: false,
  needsTermsAcceptance: false
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isSubscribed = (() => {
    if (!profile || profile.subscriptionStatus !== 'active' || !profile.expiresAt) return false;
    
    try {
      const expiryDate = profile.expiresAt?.toDate 
        ? profile.expiresAt.toDate() 
        : new Date(profile.expiresAt);
        
      return expiryDate > new Date();
    } catch (e) {
      console.error("Subscription date parse error", e);
      return false;
    }
  })();

  const isExpired = profile?.subscriptionStatus === 'active' && 
                    profile?.expiresAt && 
                    (profile.expiresAt.toDate ? profile.expiresAt.toDate() : new Date(profile.expiresAt)) <= new Date();

  // Se estamos carregando e temos um usuário mas não temos perfil, consideramos que PRECISA (para evitar flicker)
  // Ou melhor, apenas calculamos se profile for válido.
  const needsTermsAcceptance = user !== null && profile !== null && profile.termsAccepted !== true;

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true); // Garante que estamos carregando ao trocar de usuário

    let unsubscribeProfile: () => void;

    const setupProfile = async () => {
      try {
        await ensureUserProfile(user); 
        
        unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
          if (snapshot.exists()) {
            setProfile(snapshot.data() as UserProfile);
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile sync error:", error);
          setLoading(false);
        });
      } catch (err) {
        console.error("Setup profile error:", err);
        setLoading(false);
      }
    };

    setupProfile();

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isSubscribed, isExpired, needsTermsAcceptance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
