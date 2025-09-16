import type { User } from "./user";

export interface SignInResponse {
  access_token: string;
  token_type: "bearer";
  user: Pick<User, "id" | "email" | "first_name">; // only what's returned
}

// ----- Sign Up -----
export interface SignUpRequest {
  first_name:   string;
  last_name:    string;
  company_name: string;
  email:        string;
  password:     string;
}

export interface SignUpResponse {
  message: string;
  user: {
    email: string;
    first_name: string;
  };
}

// ----- Sign In -----
export interface SignInRequest {
  email:    string;
  password: string;
}

export interface SignInResponse {
  access_token: string;
  token_type: "bearer";
  user: {
    id: number;
    email: string;
    first_name: string;
  };
}


export interface Token {
  access_token: string;
  token_type: string;
  user?: SignUpResponse; // Make user optional
}
