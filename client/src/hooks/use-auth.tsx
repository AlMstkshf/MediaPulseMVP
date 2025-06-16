import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
  language: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  notificationPrefs?: {
    email: {
      alerts: boolean;
      reports: boolean;
      system: boolean;
      marketing: boolean;
    };
    inApp: {
      alerts: boolean;
      mentions: boolean;
      system: boolean;
    };
    mobileApp: {
      alerts: boolean;
      reports: boolean;
    };
  };
  sessionTimeout?: number;
}

interface LoginHistory {
  id: number;
  userId: number;
  loginTime: Date;
  status: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  failureReason?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  getLoginHistory: (limit?: number) => Promise<LoginHistory[]>;
  setup2FA: () => Promise<{ secret: string }>;
  enable2FA: (token: string) => Promise<{ enabled: boolean, recoveryCodes: string[] }>;
  disable2FA: () => Promise<{ enabled: boolean }>;
  updateNotificationPreferences: (prefs: NonNullable<User['notificationPrefs']>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Check for existing user session on initial load from server
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/user");
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        // User is not authenticated
        console.log("User not authenticated:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user && location !== "/login") {
      navigate("/login");
    }
  }, [user, isLoading, location, navigate]);
  
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Use the correct API endpoint matching the server routes in auth.ts
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const userData = await response.json();
      
      setUser(userData);
      // No longer storing user in localStorage to rely on session cookies
      
      navigate("/");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      // Make sure this matches the endpoint in auth.ts
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error("No user is logged in");
      }
      
      // Make API request to update user profile
      const response = await apiRequest("PATCH", `/api/users/${user.id}`, profileData);
      const updatedUserData = await response.json();
      
      // Update local state only
      const newUserData = { ...user, ...updatedUserData };
      setUser(newUserData);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get login history
  const getLoginHistory = async (limit: number = 10): Promise<LoginHistory[]> => {
    try {
      if (!user) {
        throw new Error("No user is logged in");
      }
      
      const response = await apiRequest("GET", `/api/users/login-history?limit=${limit}`);
      const data = await response.json();
      
      // Convert string dates to Date objects
      return data.map((item: any) => ({
        ...item,
        loginTime: new Date(item.loginTime)
      }));
    } catch (error) {
      console.error("Error fetching login history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch login history",
        variant: "destructive",
      });
      return [];
    }
  };
  
  // Set up 2FA
  const setup2FA = async (): Promise<{ secret: string }> => {
    try {
      if (!user) {
        throw new Error("No user is logged in");
      }
      
      const response = await apiRequest("POST", "/api/users/2fa/setup");
      const data = await response.json();
      
      toast({
        title: "2FA Setup Initiated",
        description: "Two-factor authentication setup has been initiated.",
      });
      
      return { secret: data.secret };
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      toast({
        title: "Error",
        description: "Failed to set up two-factor authentication",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Enable 2FA
  const enable2FA = async (token: string): Promise<{ enabled: boolean, recoveryCodes: string[] }> => {
    try {
      if (!user) {
        throw new Error("No user is logged in");
      }
      
      const response = await apiRequest("POST", "/api/users/2fa/enable", { token });
      const data = await response.json();
      
      // Update user data with 2FA enabled
      const updatedUser = { ...user, twoFactorEnabled: true };
      setUser(updatedUser);
      
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled successfully.",
      });
      
      return { 
        enabled: data.enabled, 
        recoveryCodes: data.recoveryCodes 
      };
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      toast({
        title: "Error",
        description: "Failed to enable two-factor authentication",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Disable 2FA
  const disable2FA = async (): Promise<{ enabled: boolean }> => {
    try {
      if (!user) {
        throw new Error("No user is logged in");
      }
      
      const response = await apiRequest("POST", "/api/users/2fa/disable");
      const data = await response.json();
      
      // Update user data with 2FA disabled
      const updatedUser = { ...user, twoFactorEnabled: false };
      setUser(updatedUser);
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
      
      return { enabled: data.enabled };
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      toast({
        title: "Error",
        description: "Failed to disable two-factor authentication",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update notification preferences
  const updateNotificationPreferences = async (prefs: NonNullable<User['notificationPrefs']>): Promise<boolean> => {
    try {
      if (!user) {
        throw new Error("No user is logged in");
      }
      
      // Make API request to update notification preferences
      const response = await apiRequest("PATCH", `/api/users/${user.id}/notifications`, { 
        notificationPrefs: prefs 
      });
      const updatedData = await response.json();
      
      // Update local state only with new preferences
      const updatedUser = { ...user, notificationPrefs: prefs };
      setUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateProfile,
        getLoginHistory,
        setup2FA,
        enable2FA,
        disable2FA,
        updateNotificationPreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
