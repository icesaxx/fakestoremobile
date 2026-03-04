import { jwtDecode } from "jwt-decode";

export type TokenPayload = {
  iat?: number;
  exp?: number;
  sub?: string;
  user?: string;
};

export const LOCAL_SESSION_PREFIX = "local:";
export const LOCAL_ACCOUNTS_KEY = "local_accounts";

export const isLocalSessionToken = (token: string): boolean =>
  token.startsWith(LOCAL_SESSION_PREFIX);

export const createLocalSessionToken = (username: string): string =>
  `${LOCAL_SESSION_PREFIX}${username}:${Date.now()}`;

export const decodeTokenSafely = (token: string): TokenPayload | null => {
  if (isLocalSessionToken(token)) return null;
  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  if (isLocalSessionToken(token)) return false;

  const payload = decodeTokenSafely(token);
  if (!payload) return true;

  // FakeStore tokens may not include exp. Treat those as non-expiring demo tokens.
  if (!payload.exp) return false;

  return payload.exp * 1000 <= Date.now();
};

export const parseStoredUser = (value: string | null): TokenPayload | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as TokenPayload;
    if (typeof parsed?.sub !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
};

export type LocalAccount = {
  id: number;
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
};

export const parseLocalAccounts = (value: string | null): LocalAccount[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as LocalAccount[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (acc) =>
        typeof acc?.id === "number" &&
        typeof acc?.username === "string" &&
        typeof acc?.password === "string"
    );
  } catch {
    return [];
  }
};
