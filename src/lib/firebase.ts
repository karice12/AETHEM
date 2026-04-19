import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Tipos
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  plan: 'free' | 'monthly' | 'yearly';
  subscriptionStatus?: 'active' | 'expired' | 'inactive';
  expiresAt?: any;
  createdAt: any;
}

export interface PromptEntry {
  id?: string;
  idea: string;
  category: string;
  destination: string;
  answers: Record<string, string>;
  result: string;
  createdAt: any;
}

// Persistência de Perfil
export async function ensureUserProfile(user: FirebaseUser) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      plan: 'free',
      createdAt: serverTimestamp()
    };
    await setDoc(userRef, profile);
    return profile;
  }
  return userSnap.data() as UserProfile;
}

// Histórico de Prompts
export function subscribeToPrompts(userId: string, callback: (prompts: PromptEntry[]) => void) {
  const promptsRef = collection(db, 'users', userId, 'prompts');
  const q = query(promptsRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const prompts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PromptEntry[];
    callback(prompts);
  });
}

export async function saveForgeResult(userId: string, data: Omit<PromptEntry, 'id' | 'createdAt'>) {
  const promptsRef = collection(db, 'users', userId, 'prompts');
  await addDoc(promptsRef, {
    ...data,
    userId,
    createdAt: serverTimestamp()
  });
}

// Lógica de Pagamento (Simulação de Upgrade)
export async function simulateSubscriptionUpgrade(userId: string, plan: 'monthly' | 'yearly') {
  const userRef = doc(db, 'users', userId);
  const now = new Date();
  const expiresAt = new Date();

  if (plan === 'monthly') {
    expiresAt.setMonth(now.getMonth() + 1);
  } else if (plan === 'yearly') {
    expiresAt.setFullYear(now.getFullYear() + 1);
  }

  await setDoc(userRef, {
    plan,
    subscriptionStatus: 'active',
    expiresAt: expiresAt,
    updatedAt: serverTimestamp()
  }, { merge: true });
}
