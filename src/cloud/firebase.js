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
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

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

const SLOT_COUNT = 4;

// Pulls the saved [auto, slot1, slot2, slot3] array for the current device's anonymous
// user. Returns null if cloud sync is disabled or the read fails — callers should treat
// null as "nothing to merge" and keep local saves. Each slot lives in its own Firestore
// document (saves/{uid}/slots/{i}) rather than one combined doc — see pushCloudSaves for
// why: a single doc holding every slot risked outgrowing Firestore's 1MiB-per-document
// cap as a save's history grew, even though any one slot alone was well under it.
export async function pullCloudSaves() {
  if (!cloudEnabled) return null;
  try {
    const uid = await whenAuthReady();
    const snaps = await Promise.all(
      Array.from({ length: SLOT_COUNT }, (_, i) =>
        getDoc(doc(db, 'saves', uid, 'slots', String(i))),
      ),
    );
    return snaps.map((snap) => (snap.exists() ? snap.data().save : null));
  } catch (e) {
    console.error('[cloud] pull failed:', e);
    return null;
  }
}

// Firestore rejects (a) arrays whose direct elements are themselves arrays and (b)
// explicit `undefined` field values (e.g. buildSaveData's `simState: undefined`
// placeholder). App-level code already flattens the one known source of nested
// arrays (swiss match records) for the *active* save slot, but `pushCloudSaves`
// mirrors all four slots verbatim every time — including slots nobody has touched
// this session, which may still carry an older, unsanitized shape from before that
// fix existed. Sanitizing generically right at the write boundary catches that (and
// any future source of the same shape) without having to hunt down every call site.
function sanitizeForFirestore(value) {
  if (Array.isArray(value)) {
    const mapped = value.map(sanitizeForFirestore);
    return mapped.some(Array.isArray) ? mapped.flat(Infinity) : mapped;
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue;
      out[k] = sanitizeForFirestore(v);
    }
    return out;
  }
  return value;
}

// 1MiB Firestore per-document cap, minus headroom for the wrapper fields
// (updatedAt) and JSON.stringify's ASCII-length only approximating real UTF-8
// byte size. Not a hard gate — just a console warning so an oversized slot
// surfaces as "slot 2 is 1.3MB" instead of an opaque doc-path error.
const SIZE_WARN_BYTES = 900_000;

// Recursively logs which keys actually account for an oversized slot's bytes —
// offline size modeling (simulated seasons) hasn't matched what shows up in real
// saves, so instead of guessing further, log the real breakdown at the exact
// moment the warning fires. Descends into any key over 20KB, up to `depth` levels,
// and ignores anything under 500B so the output stays readable.
function logSizeBreakdown(label, value, depth) {
  if (!value || typeof value !== 'object' || depth <= 0) return;
  const entries = Array.isArray(value) ? value.map((v, i) => [String(i), v]) : Object.entries(value);
  entries
    .map(([k, v]) => ({ key: k, bytes: JSON.stringify(v ?? null).length, v }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 15)
    .forEach(({ key, bytes, v }) => {
      if (bytes < 500) return;
      console.warn(`[cloud]   ${label}.${key}: ${(bytes / 1024).toFixed(1)}KB`);
      if (bytes > 20_000) logSizeBreakdown(`${label}.${key}`, v, depth - 1);
    });
}

// Mirrors the local [auto, slot1, slot2, slot3] array to Firestore, one document per
// slot (saves/{uid}/slots/{i}) instead of a single combined document. Previously all
// four slots were bundled into one doc and pushed together on every autosave; a
// long-running save's accumulated history eventually pushed that combined doc past
// Firestore's 1MiB-per-document limit even though no individual slot was anywhere
// near that size on its own. Splitting also means a normal autosave (which only ever
// changes one slot) no longer has to re-upload the other three every time. Null slots
// are deleted rather than written, so pullCloudSaves sees a missing doc as empty.
// Fire-and-forget on the caller's critical path — local storage is the source of
// truth for "did the save succeed," cloud is best-effort backup/cross-device sync.
// Returns true/false so the UI can show a sync status without the failure being
// silently swallowed.
export async function pushCloudSaves(slots) {
  if (!cloudEnabled) return false;
  try {
    const uid = await whenAuthReady();
    const sanitized = sanitizeForFirestore(slots);
    await Promise.all(
      sanitized.map((save, i) => {
        const ref = doc(db, 'saves', uid, 'slots', String(i));
        if (!save) return deleteDoc(ref);
        const size = JSON.stringify(save).length;
        if (size > SIZE_WARN_BYTES) {
          console.warn(
            `[cloud] save slot ${i} is ~${(size / 1_000_000).toFixed(2)}MB — approaching Firestore's 1MiB document limit. Breakdown:`,
          );
          logSizeBreakdown(`slot${i}`, save, 4);
        }
        return setDoc(ref, { save, updatedAt: new Date().toISOString() });
      }),
    );
    return true;
  } catch (e) {
    console.error('[cloud] push failed:', e);
    return false;
  }
}
