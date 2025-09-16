import React, { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/context/ProjectsProvider';
import { useProjectNavigation } from '@/hooks/useProjectNavigation';
import { Download, MoreVertical, Trash2, FileBarChart2 } from 'lucide-react';
import { getStepPath } from "@/utils/steps";
import ErrorMessage from "@/components/ErrorMessage";
import toast from "react-hot-toast";

const TOTAL_STEPS = 5;

type ProjectStatus = 
  | 'not_started'
  | 'in_progress_1'
  | 'in_progress_2'
  | 'in_progress_3'
  | 'in_progress_4'
  | 'data_uploaded'
  | 'variables_selected'
  | 'targets_uploaded'
  | 'weighting_done'
  | 'rapport_generated'
  | 'finished';

interface Project {
  id: string | number;
  name: string;
  status: string;
  created_at?: string;
  current_step?: number;
  steps_completed?: number[];
}

const statusDisplay: Record<ProjectStatus, string> = {
  not_started: "Not Started",
  in_progress_1: "Data Uploaded",
  in_progress_2: "Variables Selected",
  in_progress_3: "Targets Uploaded",
  in_progress_4: "Weighting Done",
  data_uploaded: "Data Uploaded",
  variables_selected: "Variables Selected",
  targets_uploaded: "Targets Uploaded",
  weighting_done: "Weighting Done",
  rapport_generated: "Rapport Generated",
  finished: "Finished"
};

const statusClass: Record<ProjectStatus, string> = {
  not_started: "status--notstarted",
  in_progress_1: "status--uploaded",
  in_progress_2: "status--variables",
  in_progress_3: "status--targets",
  in_progress_4: "status--weighting",
  data_uploaded: "status--uploaded",
  variables_selected: "status--variables",
  targets_uploaded: "status--targets",
  weighting_done: "status--weighting",
  rapport_generated: "status--rapport",
  finished: "status--finished"
};

function getDisplayStatus(status: string, current_step: number = 1): string {
  const statusMap: Record<string, string> = {
    'not_started': 'Not Started',
    'in_progress': `Step ${Math.min(current_step, 5)} of 5`,
    'completed': 'Completed',
    'data_uploaded': 'Data Uploaded',
    'variables_selected': 'Variables Selected',
    'targets_uploaded': 'Targets Uploaded',
    'weighting_done': 'Weighting Done',
    'rapport_generated': 'Rapport Generated',
    'finished': 'Finished'
  };
  return statusMap[status] || status;
}

function isProjectStatus(status: string): status is ProjectStatus {
  return status in statusDisplay;
}

export default function MyProjects(): ReactElement {
  const { projects, deleteProject, getNextUncompletedStep } = useProjects();
  const navigate = useNavigate();
  const didJustDelete = React.useRef(false);
  const [error, setError] = useState<string | null>(null)
  
  useProjectNavigation();

  const [localProjects, setLocalProjects] = React.useState<Project[]>(projects);

  React.useEffect(() => {
    if (!didJustDelete.current) {
      setLocalProjects(projects);
    }
  }, [projects]);

  const handleDeleteProject = async (e: React.MouseEvent, projectId: number | string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    const previousProjects = [...localProjects];
    didJustDelete.current = true;

    setLocalProjects(prev => prev.filter(p => p.id !== projectId));
    setError(null);

    try {
      await deleteProject(String(projectId));
      toast.success("Project deleted successfully!");
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      
      let errorMessage = "Failed to delete project";
      if (error?.response?.status === 404) {
        errorMessage = "Project not found. It may have been already deleted.";
      } else if (error?.response?.status === 403) {
        errorMessage = "You don't have permission to delete this project.";
      } else if (error?.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      setLocalProjects(previousProjects);
    } finally {
      setTimeout(() => {
        didJustDelete.current = false;
      }, 500);
    }
  };

  const handleDownload = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    try {
      window.open(
        `${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/api/projects/${id}/download-weighted`,
        "_blank"
      );
    } catch (error: any) {
      let errorMessage = "Failed to download file";
      if (error?.response?.status === 404) {
        errorMessage = "File not found. The weighted data may not be available yet.";
      } else if (error?.response?.status === 403) {
        errorMessage = "You don't have permission to download this file.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDownloadRapport = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    try {
      window.open(
        `${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/api/projects/${id}/download-rapport`,
        "_blank"
      );
    } catch (error: any) {
      let errorMessage = "Failed to download rapport";
      if (error?.response?.status === 404) {
        errorMessage = "Rapport not found. It may not be generated yet.";
      } else if (error?.response?.status === 403) {
        errorMessage = "You don't have permission to download this rapport.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleProjectClick = async (project: Project) => {
    try {
      const projectId = String(project.id);
      const { redirect_to, next_step } = await getNextUncompletedStep(projectId);

      console.log("Redirecting to:", `/dashboard/project/${projectId}/${redirect_to}`);
      console.log("API response:", { redirect_to, next_step });

      if (!redirect_to) throw new Error("No redirect_to received");
      navigate(`/dashboard/project/${projectId}/${getStepPath(next_step)}`);

    } catch (err) {
      console.error("Redirect failed, fallback:", err);
      navigate(`/dashboard/project/${project.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <ErrorMessage 
            message={error} 
            onDismiss={() => setError(null)}
            className="mb-6"
          />
        )}
        <div className="flex flex-col gap-6">
          <div className="table-card">
            <table className="project-table w-full">
              <thead>
                <tr>
                  <th className="text-left">Project Name</th>
                  <th className="text-left">Date Created</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {localProjects.map((project) => {
                  const safeStatus = isProjectStatus(project.status) 
                    ? project.status 
                    : 'not_started';
                  const projectId = String(project.id);

                  return (
                    <tr
                      key={project.id}
                      onClick={() => handleProjectClick(project)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <td>{project.name}</td>
                      <td>
                        {project.created_at
                          ? new Date(project.created_at).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td>
                        <span className={`status ${statusClass[safeStatus]}`}>
                          {getDisplayStatus(project.status, project.current_step)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {/* Télécharger les données pondérées */}
                          {(safeStatus === "weighting_done" || safeStatus === "rapport_generated" || safeStatus === "finished") && (
                            <button
                              onClick={(e) => handleDownload(e, project.id)}
                              className="icon-btn warning"
                              title="Download weighted data"
                            >
                              <Download size={18} />
                            </button>
                          )}
                          
                          {/* Télécharger le rapport */}
                          {(safeStatus === "rapport_generated" || safeStatus === "finished") && (
                            <button
                              onClick={(e) => handleDownloadRapport(e, project.id)}
                              className="icon-btn success"
                              title="Download rapport"
                            >
                              <FileBarChart2 size={18} />
                            </button>
                          )}
                          {safeStatus === "finished" && (
  <button
    onClick={(e) => handleDownload(e, project.id)}
    className="icon-btn warning"
    title="Download weighted file"
  >
    <Download size={18} />
  </button>
)}
                          
                          <button
                            onClick={(e) => handleDeleteProject(e, project.id)}
                            className="icon-btn danger hover:bg-red-100 hover:text-red-700"
                            title="Delete project"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                

                {localProjects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500">
                      No projects yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}