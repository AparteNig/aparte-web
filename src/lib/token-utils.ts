export type TokenPayload = {
  sub?: string;
  entityType?: "user" | "host" | "admin";
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
};

export const decodeJwtPayload = (token: string): TokenPayload | null => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(decodeBase64Url(payload)) as TokenPayload;
  } catch {
    return null;
  }
};

export const getIdentityFromToken = (token: string) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.entityType || !payload?.sub) return null;
  return `${payload.entityType}_${payload.sub}`;
};
