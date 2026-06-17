import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { syncUser, SyncUserData } from "../services/userService";
import { setTokenFetcher } from "../services/api";
import { identifyUser, resetUser, trackEvent } from "../utils/posthog";

export interface DBUser {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  role: "student" | "faculty" | "operator" | "admin";
  rollNo?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextProps {
  dbUser: DBUser | null;
  isLoadingDbUser: boolean;
  isProfileCompleted: boolean;
  refetchDbUser: () => Promise<void>;
  syncProfile: (rollNo: string, department: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [isLoadingDbUser, setIsLoadingDbUser] = useState<boolean>(true);

  // Set the token fetcher in our api service
  useEffect(() => {
    if (isSignedIn) {
      setTokenFetcher(async () => {
        try {
          return await getToken();
        } catch (e) {
          console.error("AuthContext: Failed to fetch token", e);
          return null;
        }
      });
    } else {
      setTokenFetcher(() => Promise.resolve(null));
      setDbUser(null);
      setIsLoadingDbUser(false);
      resetUser();
    }
  }, [isSignedIn, getToken]);

  const performSync = async () => {
    if (!isSignedIn || !user) {
      setDbUser(null);
      setIsLoadingDbUser(false);
      return;
    }

    try {
      setIsLoadingDbUser(true);
      const token = await getToken();
      const email =
        user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses?.[0]?.emailAddress ||
        "";
      const name = user.fullName || user.username || user.firstName || "User";
      
      const response = await syncUser({
        clerkId: user.id,
        email,
        name,
      }, token);

      if (response && response.success && response.data) {
        const userData: DBUser = response.data;
        setDbUser(userData);
        identifyUser(userData.clerkId, {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          rollNo: userData.rollNo,
          department: userData.department,
        });
      }
    } catch (error) {
      console.error("AuthContext: failed to sync user with backend DB", error);
    } finally {
      setIsLoadingDbUser(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && user) {
      performSync();
    }
  }, [isSignedIn, user]);

  const syncProfile = async (rollNo: string, department: string) => {
    if (!isSignedIn || !user) return;
    try {
      setIsLoadingDbUser(true);
      const token = await getToken();
      const email =
        user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses?.[0]?.emailAddress ||
        "";
      const name = user.fullName || user.username || user.firstName || "User";

      const response = await syncUser({
        clerkId: user.id,
        email,
        name,
        rollNo,
        department,
      }, token);

      if (response && response.success && response.data) {
        const userData: DBUser = response.data;
        setDbUser(userData);
        trackEvent("profile_completed", {
          rollNo,
          department,
          role: userData.role,
        });
      }
    } catch (e) {
      console.error("AuthContext: failed to complete profile", e);
    } finally {
      setIsLoadingDbUser(false);
    }
  };

  const isProfileCompleted = React.useMemo(() => {
    if (!dbUser) return false;
    // Admins and Operators don't need to complete roll number/department details.
    if (dbUser.role === "admin" || dbUser.role === "operator") {
      return true;
    }
    return !!(dbUser.rollNo && dbUser.department);
  }, [dbUser]);

  return (
    <AuthContext.Provider
      value={{
        dbUser,
        isLoadingDbUser,
        isProfileCompleted,
        refetchDbUser: performSync,
        syncProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAppAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAppAuth must be used within an AuthProvider");
  }
  return context;
};
