/** The JWT payload, decoded client-side without verifying it; null when malformed. */
export const decodeToken = (token: string): any | null => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

/** True when the token has no `exp` or it has passed (`exp` is in seconds). */
export const isTokenExpired = (token: string): boolean => {
  const exp = decodeToken(token)?.exp;

  return !exp || exp * 1000 < Date.now();
};
