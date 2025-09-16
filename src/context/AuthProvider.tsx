// src/context/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { setAuthToken } from "@/services/api";
import axios from "axios";
import type { SignUpRequest, SignInRequest, SignInResponse } from "@/types/auth";
import type { User } from "@/types/user";
import type { Role } from "@/types/role";
import { Project } from "@/types/project";


interface AuthHistory {
  id: string;
  action: string;
  timestamp: Date;
  details?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  history: AuthHistory[];
  credits: number;
  signUp: (data: SignUpRequest) => Promise<User>;
  signIn: (data: SignInRequest) => Promise<void>;
  signOut: () => void;
  checkAuth: () => Promise<boolean>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  addHistory: (action: string, details?: string) => void;
  projects: Project[];
  loadingProjects: boolean;
  fetchProjects: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<AuthHistory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [credits, setCredits] = useState<number>(0);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await api.get<Project[]>("/api/projects");
      setProjects(response.data);  // not "data"


    } catch (error) {
      console.error("Failed to fetch projects", error);
      toast.error("Failed to load projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  const addHistory = (action: string, details?: string) => {
    const newEntry: AuthHistory = {
      id: Math.random().toString(36).slice(2),
      action,
      timestamp: new Date(),
      details,
    };
    setHistory((prev) => [newEntry, ...prev].slice(0, 50));
  };

  // Load user on startup if token is present
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) { setLoading(false); return; }

  api.defaults.headers.common.Authorization = `Bearer ${token}`;
  (async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (e) {
      // optional: silent signout
      localStorage.removeItem("token");
      localStorage.removeItem("auth");
      delete api.defaults.headers.common.Authorization;
    } finally {
      setLoading(false);
    }
  })();
}, []);


  const signUp = async (userData: SignUpRequest): Promise<User> => {
    setLoading(true);
    try {
      const { data } = await api.post<User>("/auth/signup", userData);
      toast.success("Registration successful!");
      return data;
    } catch (error: unknown) {
      let msg = "Registration failed";
      if (axios.isAxiosError(error)) msg = (error.response?.data as any)?.detail || msg;
      toast.error(msg);
      addHistory("Failed registration", msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data: SignInRequest): Promise<void> => {
    setLoading(true);
    try {
      const res = await api.post<SignInResponse>("/auth/signin", {
        username: data.email,
        password: data.password,
      });

      const { access_token, user: u } = res.data;

      // Store token (and user if you want), and ensure axios sends it
      localStorage.setItem("token", access_token);
      localStorage.setItem("auth", JSON.stringify({ access_token, user: u }));
      api.defaults.headers.common.Authorization = `Bearer ${access_token}`;

      setUser(u);

      // Optional role-based redirect (fallback to "user")
      const role: Role = (u as User).role ?? "user";
      if (role === "admin") navigate("/admin-dashboard", { replace: true });
      else if (role === "client") navigate("/client-dashboard", { replace: true });
      else navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Sign-in failed", error);
      toast.error("Invalid credentials");
      addHistory("Failed sign-in");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("If an account exists, an email has been sent.");
      addHistory("Password reset requested", `For: ${email}`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Error sending email";
      toast.error("Could not send email");
      addHistory("Failed password reset", msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  

const resetPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
    setLoading(true);
    try {
        const response = await axios.post("/auth/reset-password", {
            email,
            code,
            new_password: newPassword
        });
        return response.data;
    } catch (error) {
        console.error("Error in resetPassword:", error);
        throw error;
    } finally {
        setLoading(false);
    }
};


  const signOut = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    setAuthToken(null); // ✅ clears api default header
    setUser(null);
    addHistory("Logged out");
    navigate("/signin");
    toast.success("Successfully logged out");
  };

  const checkAuth = async (): Promise<boolean> => {
    try {
      const token =
        localStorage.getItem("token") ||
        (() => {
          const raw = localStorage.getItem("auth");
          if (!raw) return null;
          try {
            return JSON.parse(raw).access_token ?? null;
          } catch {
            return null;
          }
        })();
      if (!token) return false;
      await api.get("/auth/me");
      return true;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("auth");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        history,
        credits,
        signUp,
        signIn,
        signOut,
        checkAuth,
        forgotPassword,
        resetPassword,
        addHistory,
        projects,
        loadingProjects,
        fetchProjects,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
