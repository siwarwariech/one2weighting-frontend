// src/components/ProjectStatusButton.tsx
import { useState } from 'react';
import { updateProjectStatus } from '../services/api';

function ProjectStatusButton({ projectId }: { projectId: number }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusUpdate = async () => {
    setIsLoading(true);
    try {
      await updateProjectStatus(projectId, "in_progress");
      // Success actions:
      alert("Status updated successfully!");
      // Optionally refresh project data:
      // fetchProjectData(); 
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleStatusUpdate}
      disabled={isLoading}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      {isLoading ? 'Updating...' : 'Mark as In Progress'}
    </button>
  );
}