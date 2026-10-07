import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (token: string, email: string, name?: string) => void;
  logout: () => void;
  updateName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'tripmind_token';
const USER_KEY = 'tripmind_user';

function loadFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadFromStorage);

  const login = useCallback((token: string, email: string, name?: string) => {
    const u: User = {
      id: crypto.randomUUID(),
      email,
      name: name || email.split('@')[0],
      token,
    };
    setUser(u);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const updateName = useCallback((name: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, name };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token: user?.token ?? null,
        isLoggedIn: !!user,
        login,
        logout,
        updateName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
