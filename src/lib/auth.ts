export const ADMIN_AUTH_COOKIE = "aparte_admin_token";
export const HOST_AUTH_COOKIE = "aparte_host_token";
export const COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours

export const setAuthCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

export const clearAuthCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};
