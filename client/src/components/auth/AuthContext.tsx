import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  email: string;
  username: string;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: async () => false,
  checkAuthStatus: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const response = await apiRequest("GET", "/api/auth/user");
      
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.status === "success" && responseData.data) {
          setUser(responseData.data);
          setIsAuthenticated(true);
          return true;
        } else {
          setUser(null);
          setIsAuthenticated(false);
          return false;
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password }, true);
      
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.status === "success" && responseData.data) {
          // After login, explicitly check auth status to ensure session is properly set
          await checkAuthStatus();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest("POST", "/api/auth/register", { email, username, password }, true);
      
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.status === "success" && responseData.data) {
          // After registration, explicitly check auth status to ensure session is properly set
          await checkAuthStatus();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      const response = await apiRequest("POST", "/api/auth/logout", undefined, true);
      
      if (response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}