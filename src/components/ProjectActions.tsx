import { Project } from "@/types/project";

// src/components/ProjectActions.tsx
interface ProjectActionsProps {
  project: Project;
  canDownload: boolean;
}

export const ProjectActions = ({ project, canDownload }: ProjectActionsProps) => {
  if (project.status === "Finished") {
    return (
      <button
        disabled={!canDownload}
        className={`${
          canDownload ? "text-blue-600 hover:text-blue-900" : "text-gray-400 cursor-not-allowed"
        }`}
      >
        {canDownload ? "Download (1 credit)" : "No credits"}
      </button>
    );
  }

  return (
    <div className="flex space-x-2">
      <button className="text-indigo-600 hover:text-indigo-900">
        View
      </button>
      <button className="text-gray-600 hover:text-gray-900">
        Edit
      </button>
    </div>
  );
};