// Session management utilities
export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  loginTime: string;
}

export function getUserSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const session = localStorage.getItem('userSession');
    if (!session) return null;
    
    const parsed = JSON.parse(session);
    
    // Check if session is still valid (24 hours)
    const loginTime = new Date(parsed.loginTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      // Session expired, remove it
      localStorage.removeItem('userSession');
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error parsing user session:', error);
    localStorage.removeItem('userSession');
    return null;
  }
}

export function setUserSession(user: Omit<UserSession, 'loginTime'>): void {
  if (typeof window === 'undefined') return;
  
  const session: UserSession = {
    ...user,
    loginTime: new Date().toISOString()
  };
  
  localStorage.setItem('userSession', JSON.stringify(session));
}

export function clearUserSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('userSession');
}

export function clearAllUserData(): void {
  if (typeof window === 'undefined') return;
  // Clear all user-related localStorage data to prevent contamination between accounts
  localStorage.removeItem('userSession');
  localStorage.removeItem('moneyExchangeState');
  console.log('🧹 Cleared all user data from localStorage to prevent account contamination');
}

export function forcePageRefresh(path: string = window.location.pathname): void {
  if (typeof window === 'undefined') return;
  console.log('🔄 Forcing complete page refresh to clear all cache and memory');
  window.location.href = path;
}

export function isUserLoggedIn(): boolean {
  return getUserSession() !== null;
}
