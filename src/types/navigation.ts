// src/types/navigation.ts
export type ProjectStep = 1 | 2 | 3 | 4 | 5;  // Explicit numeric literal types

export type StepRoutes = {
    [key in ProjectStep]: string;
};


// src/types/navigation.ts
export const STEP_ROUTES = {
  1: 'upload',
  2: 'variables',
  3: 'targets',
  4: 'weighting',
  5: 'report'
} as const;

export type StepNumber = keyof typeof STEP_ROUTES;
export type StepPath = typeof STEP_ROUTES[StepNumber];

// Utility type for API response
export interface NextStepResponse {
  next_step: StepNumber;
}