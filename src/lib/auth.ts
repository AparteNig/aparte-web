export const ADMIN_AUTH_COOKIE = "aparte_admin_token";
export const HOST_AUTH_COOKIE = "aparte_host_token";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 3; // 3 days

export const setAuthCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

export const getAuthCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split("; ").filter(Boolean);
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
};

export const clearAuthCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};
