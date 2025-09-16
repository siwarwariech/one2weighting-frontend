// src/types/project.ts
export interface Project {
  id: string | number; // Changed to accept both string and number
  name: string;
  created_at: string;
  updated_at?: string;
  status: string;
  current_step?: number; // Made optional for backward compatibility
  steps_completed?: number[]; // Made optional for backward compatibility
  cases?: number; // Made optional (was n_cases in response)
  n_cases?: number; // Added to match backend response
  owner_id?: string; // Made optional
  owner_name?: string; // Made optional
  user_id?: number; // Kept optional
  collaborators?: Collaborator[]; // Kept optional
}

export interface Collaborator {
  user_id: string;
  name: string;
  email: string;
  role?: "Editor" | "Viewer";
}

export interface ProjectCreate {
  name: string;
  owner_id?: string;
  collaborators?: Omit<Collaborator, 'role'>[];
}

export interface ProjectResponse {
  id: number;
  name: string;
  n_cases: number;
  user_id: number;
  created_at: string;
  status: string;
  current_step?: number;
  steps_completed?: number[];
}

export function toProject(response: ProjectResponse): Project {
  return {
    id: response.id, // Now accepts number directly
    name: response.name,
    cases: response.n_cases, // Map n_cases to cases
    n_cases: response.n_cases, // Also keep original
    owner_id: String(response.user_id),
    created_at: response.created_at,
    status: response.status,
    current_step: response.current_step || 0,
    steps_completed: response.steps_completed || [],
    user_id: response.user_id
  };
}

// Helper type for the frontend project list display
export interface ProjectListItem {
  id: string | number;
  name: string;
  created_at: string;
  status: string;
  current_step?: number;
}

// In your frontend types
export interface ColumnMeta {
  name: string;
  type: string;
  unique: number;
  sample: any[];
  blank_ratio: number;
  blank_count: number;
  total_count: number;
}