"use client";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider, createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail,
  signInWithCustomToken, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, type User,
} from "firebase/auth";

const app = getApps().length ? getApp() : initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const auth = getAuth(app);

/** ID tokenni serverga yuborib, httpOnly session cookie o‘rnatadi. */
async function startSession(user: User) {
  const idToken = await user.getIdToken(true);
  const r = await fetch("/api/auth/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken }) });
  if (!r.ok) throw new Error("session");
  await signOut(auth); // brauzerda Firebase holati kerak emas, server cookie yetarli
}

export async function signInGoogle() {
  const cred = await signInWithPopup(auth, new GoogleAuthProvider());
  await startSession(cred.user);
}
export async function signInEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await startSession(cred.user);
}
export async function signUpEmail(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
  await startSession(cred.user);
}
export async function signInWithTelegramToken(token: string) {
  const cred = await signInWithCustomToken(auth, token);
  await startSession(cred.user);
}
export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);
export async function signOutEverywhere() {
  await fetch("/api/auth/logout", { method: "POST" });
  await signOut(auth).catch(() => {});
}
