import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import React, { createContext, useEffect, useMemo, useState } from "react";

import { auth } from "@/firebase";
import {
  getAuthErrorMessage,
  logout as logoutService,
  signIn as signInService,
  signUp as signUpService,
} from "@/services/authService";
import { getUserProfile } from "@/services/userService";
import type { UserProfile } from "@/types/user";

interface AuthContextValue {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  role: number;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchProfile = async (uid: string) => {
    try {
      const userProfile = await getUserProfile(uid);
      setProfile(userProfile);
    } catch {
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const role = Number(profile?.role ?? 1);
  const isAdmin = role === 0;

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signUpService(email, password);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInService(email, password);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutService();
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      role,
      isAdmin,
      loading,
      authError,
      signUp,
      signIn,
      logout,
      refreshProfile,
    }),
    [authError, isAdmin, loading, profile, role, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
};

