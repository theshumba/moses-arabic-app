/**
 * FirebaseService — Firebase anonymous auth, Firestore sync, and device linking.
 *
 * Features:
 * - Anonymous auth (persistent UID per device)
 * - Read/write progress, settings, stats to Firestore
 * - Device linking via 6-char codes (10-min expiry)
 * - Debounced Firestore writes
 */

import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase.js';

const SYNC_DEBOUNCE_MS = 3000;
const LINK_CODE_EXPIRY_MS = 10 * 60 * 1000;
const LINK_CODE_LENGTH = 6;

const pendingSync = new Map();

let currentUid = null;

let authReadyResolve;
const authReady = new Promise((resolve) => {
  authReadyResolve = resolve;
});

onAuthStateChanged(auth, (user) => {
  currentUid = user ? user.uid : null;
  authReadyResolve(currentUid);
});

const FirebaseService = {
  async init() {
    try {
      const result = await signInAnonymously(auth);
      currentUid = result.user.uid;
      return currentUid;
    } catch (err) {
      console.error('[FirebaseService] Auth failed:', err.message);
      return null;
    }
  },

  async waitForAuth() {
    return authReady;
  },

  getUid() {
    return currentUid;
  },

  async read(key) {
    if (!currentUid) return null;
    try {
      const ref = doc(db, 'users', currentUid, 'data', key);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error(`[FirebaseService] Read ${key} failed:`, err.message);
      return null;
    }
  },

  write(key, data) {
    if (!currentUid) return;

    const existing = pendingSync.get(key);
    if (existing) clearTimeout(existing.timer);

    const timer = setTimeout(async () => {
      pendingSync.delete(key);
      try {
        const ref = doc(db, 'users', currentUid, 'data', key);
        await setDoc(ref, data, { merge: true });
      } catch (err) {
        console.error(`[FirebaseService] Write ${key} failed:`, err.message);
      }
    }, SYNC_DEBOUNCE_MS);

    pendingSync.set(key, { data, timer });
  },

  async writeImmediate(key, data) {
    if (!currentUid) return false;
    try {
      const ref = doc(db, 'users', currentUid, 'data', key);
      await setDoc(ref, data, { merge: true });
      return true;
    } catch (err) {
      console.error(`[FirebaseService] WriteImmediate ${key} failed:`, err.message);
      return false;
    }
  },

  async generateLinkCode() {
    if (!currentUid) return null;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < LINK_CODE_LENGTH; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    try {
      const ref = doc(db, 'linkCodes', code);
      await setDoc(ref, {
        uid: currentUid,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + LINK_CODE_EXPIRY_MS).toISOString(),
      });
      return code;
    } catch (err) {
      console.error('[FirebaseService] Generate link code failed:', err.message);
      return null;
    }
  },

  async redeemLinkCode(code) {
    try {
      const ref = doc(db, 'linkCodes', code.toUpperCase());
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        return { success: false, error: 'Invalid code' };
      }

      const linkData = snap.data();

      if (new Date(linkData.expiresAt) < new Date()) {
        await deleteDoc(ref);
        return { success: false, error: 'Code expired' };
      }

      const sourceUid = linkData.uid;

      const progress = await this._readFromUid(sourceUid, 'progress');
      const settings = await this._readFromUid(sourceUid, 'settings');
      const stats = await this._readFromUid(sourceUid, 'stats');

      if (progress) await this.writeImmediate('progress', progress);
      if (settings) await this.writeImmediate('settings', settings);
      if (stats) await this.writeImmediate('stats', stats);

      await deleteDoc(ref);

      return { success: true, data: { progress, settings, stats } };
    } catch (err) {
      console.error('[FirebaseService] Redeem link code failed:', err.message);
      return { success: false, error: err.message };
    }
  },

  async _readFromUid(uid, key) {
    try {
      const ref = doc(db, 'users', uid, 'data', key);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data() : null;
    } catch {
      return null;
    }
  },

  async flushAll() {
    const promises = [];
    for (const [key, entry] of pendingSync) {
      clearTimeout(entry.timer);
      if (currentUid) {
        const ref = doc(db, 'users', currentUid, 'data', key);
        promises.push(setDoc(ref, entry.data, { merge: true }).catch(() => {}));
      }
    }
    pendingSync.clear();
    await Promise.all(promises);
  },
};

export { FirebaseService };
