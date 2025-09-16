// src/context/ProjectsProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthProvider";
import axios from "axios";
import { Project, ProjectResponse, toProject } from "@/types/project";

interface ProjectsContextType {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createProject: (name: string) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<void>;
  addProject: (project: Project) => void;
  updateProjectStep: (projectId: string, step: number) => Promise<void>; // Nouveau
  getNextUncompletedStep: (projectId: string) => Promise<{
  next_step: number;
  redirect_to: string;
}>;
}

const ProjectsContext = createContext<ProjectsContextType | null>(null);


export const useProjects = () => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within a ProjectsProvider");
  return ctx;
};

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects,] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();


  const deleteProject = async (projectId: string) => {
  try {
    await api.delete(`/api/projects/${projectId}`);
    // Mettre à jour l'état local immédiatement
    setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
};

  const redirectToSignIn = () => {
    // If you use react-router, prefer navigate("/signin")
    window.location.href = "/signin";
  };

 const fetchProjects = async () => {
  setLoading(true);
  setError(null);
  try {
    const { data } = await api.get<ProjectResponse[]>("/api/projects");
    setProjects(prev => {
      const deletedIds = new Set(prev.filter(p => !data.some(d => d.id === p.id)).map(p => p.id));
      return data.map(toProject).filter(p => !deletedIds.has(p.id));
    });
  } catch (err) {
    console.error("Fetch projects error:", err);
    setError("Failed to load projects");
  } finally {
    setLoading(false);
  }
};


  const addProject = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
  };

// src/context/ProjectsProvider.tsx
const createProject = async (name: string): Promise<Project> => {
  setLoading(true);
  setError(null);
  try {
    const { data } = await api.post<ProjectResponse>("/api/projects", { name });
    const newProj = toProject(data);
    setProjects((prev) => [newProj, ...prev]);
    return newProj; // ✅ Toujours retourner un Project
  } catch (err) {
    console.error("Failed to create project:", err);
    
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("auth");
        redirectToSignIn();
        throw new Error("Authentication failed");
      } else if (err.response?.status === 409) {
        throw new Error("A project with this name already exists");
      } else if (err.response?.data?.detail) {
        throw new Error(err.response.data.detail);
      }
    }
    
    throw new Error("Failed to create project");
  } finally {
    setLoading(false);
  }
};

  const updateProjectStep = async (projectId: string, step: number) => {
  try {
    const { data } = await api.patch<ProjectResponse>(`/api/projects/${projectId}/update-step`, { step });
    setProjects(prev => prev.map(p => 
      p.id === projectId ? toProject(data) : p
    ));
  } catch (err) {
    console.error("Failed to update project step:", err);
    throw err;
  }
};

const getNextUncompletedStep = async (
  projectId: string
): Promise<{ next_step: number; redirect_to: string }> => {
  const { data } = await api.get(`/api/projects/${projectId}/next-step`);
  return data;
};

  

  useEffect(() => {
  const loadProjects = async () => {
    if (!user) return; // 🔐 Wait until user is loaded
    await fetchProjects(); // utilise la fonction déjà définie
  };
  loadProjects();
}, [user]);


  return (
    <ProjectsContext.Provider
      value={{ projects, loading, error, refresh: fetchProjects, createProject, deleteProject, addProject, updateProjectStep,getNextUncompletedStep, setProjects}}
    >
      {children}
    </ProjectsContext.Provider>
  );
}
