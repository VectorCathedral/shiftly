// Simple mocked auth stored in localStorage.
const KEY = "shiftsync_auth";

export interface AuthUser {
  email: string;
  name: string;
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function signIn(email: string): AuthUser {
  const user: AuthUser = { email, name: email.split("@")[0] || "User" };
  window.localStorage.setItem(KEY, JSON.stringify(user));
  return user;
}

export function signOut() {
  window.localStorage.removeItem(KEY);
}
