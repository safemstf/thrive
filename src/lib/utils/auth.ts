export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  const standardToken = localStorage.getItem('auth-token');
  if (standardToken?.trim()) return standardToken;

  const fallbackKeys = ['authToken', 'accessToken', 'token', 'jwt', 'bearer', 'access_token'];
  for (const key of fallbackKeys) {
    const val = localStorage.getItem(key);
    if (val?.trim()) {
      localStorage.setItem('auth-token', val);
      return val;
    }
  }

  const nestedKeys = ['auth', 'user', 'session', 'authentication', 'login', 'auth-storage'];
  for (const key of nestedKeys) {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        const token =
          parsed.token || parsed.accessToken || parsed.authToken ||
          parsed?.state?.token || parsed?.state?.accessToken || parsed?.state?.authToken ||
          parsed?.user?.token || parsed?.user?.accessToken;
        if (token?.trim()) {
          localStorage.setItem('auth-token', token);
          return token;
        }
      } catch {
        // Ignore parse error
      }
    }
  }

  return null;
}
