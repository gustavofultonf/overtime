// Cloud save mirror — Firestore + anonymous auth.
//
// This is OPTIONAL: if no Firebase config is present (no VITE_FIREBASE_* env vars),
// `cloudEnabled` is false and every export below becomes a no-op. The game must keep
// working fully offline on window.storage/localStorage with zero Firebase config.
//
// Setup: copy .env.local.example to .env.local and fill in your Firebase project's
// web config (Firebase Console → Project Settings → General → Your apps → SDK setup).
// Also enable Firestore (test mode is fine to start) and the "Anonymous" sign-in
// provider under Authentication → Sign-in method.
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const cloudEnabled = !!firebaseConfig.apiKey;

let db = null;
let authReadyPromise = null;

if (cloudEnabled) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  db = getFirestore(app);

  authReadyPromise = new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) resolve(user.uid);
    });
    signInAnonymously(auth).catch(reject);
  });
}

// Resolves once an anonymous user is signed in. Used to gate every read/write so we
// always have a uid to scope the Firestore doc to (security rules require it). Races
// against a timeout so a misconfigured project (e.g. Anonymous auth not enabled in the
// console) fails fast instead of hanging callers forever.
function whenAuthReady() {
  return Promise.race([
    authReadyPromise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firebase auth timed out (10s)')), 10000),
    ),
  ]);
}

// Pulls the saved [auto, slot1, slot2, slot3] array for the current device's anonymous
// user. Returns null if cloud sync is disabled, the user has no cloud save yet, or the
// read fails — callers should treat null as "nothing to merge" and keep local saves.
export async function pullCloudSaves() {
  if (!cloudEnabled) return null;
  try {
    const uid = await whenAuthReady();
    const snap = await getDoc(doc(db, 'saves', uid));
    return snap.exists() ? snap.data().slots || null : null;
  } catch (e) {
    console.error('[cloud] pull failed:', e);
    return null;
  }
}

// Mirrors the local [auto, slot1, slot2, slot3] array to Firestore. Fire-and-forget on
// the caller's critical path — local storage is the source of truth for "did the save
// succeed," cloud is best-effort backup/cross-device sync. Returns true/false so the UI
// can show a sync status without the failure being silently swallowed.
export async function pushCloudSaves(slots) {
  if (!cloudEnabled) return false;
  try {
    const uid = await whenAuthReady();
    await setDoc(doc(db, 'saves', uid), {
      slots,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (e) {
    console.error('[cloud] push failed:', e);
    return false;
  }
}
