// src/types/user.ts

// src/types/user.ts
import type { Role } from "@/types/role";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name?: string;
  company_name?: string;
  created_at?: string;
  role?: Role; // optional but strongly typed
  avatar_url?: string; 
}

