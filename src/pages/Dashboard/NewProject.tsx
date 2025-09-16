// src/pages/Dashboard/NewProject.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useProjects } from "@/context/ProjectsProvider";
import ErrorMessage from "@/components/ErrorMessage";

export default function NewProject() {
  const [name, setName] = useState("");
  const { createProject } = useProjects();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const project = await createProject(name);
      if (project) {
        toast.success("Project created successfully!");
        navigate(`/dashboard`);
      }
    } catch (err: any) {
      let errorMessage = "Could not create project";
      
      if (err?.response?.status === 409) {
        errorMessage = "A project with this name already exists";
      } else if (err?.response?.status === 401) {
        errorMessage = "Authentication failed. Please check your credentials.";
      } else if (err?.response?.status === 403) {
        errorMessage = "You don't have permission to create projects.";
      } else if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mx-auto max-w-xl p-8 space-y-8">
      <h2 className="text-3xl font-semibold text-center">
        Create a new project
      </h2>

      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError(null)}
        />
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="proj" className="font-medium">
            Project Name
          </label>
          <input
            id="proj"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded-md border border-gray-300 px-3 py-2
                       focus:border-[var(--primary)] focus:ring-2
                       focus:ring-[var(--primary)] outline-none disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}