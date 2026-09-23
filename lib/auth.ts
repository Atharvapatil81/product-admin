// Small helpers around where we keep the login token.
// Kept in one place so nothing else in the app touches localStorage directly.

const TOKEN_KEY = "product_admin_token";
const USER_KEY = "product_admin_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null; // guards against SSR (no window on the server)
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string, username: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, username);
}

export function getUsername(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}