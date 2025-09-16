// src/utils/steps.ts
export type StepId = 1 | 2 | 3 | 4 | 5;

// correspondance id -> segment de route
export const stepToPath: Record<StepId, string> = {
  1: "upload",
  2: "variables",
  3: "targets",
  4: "weighting",
  5: "rapport", // ou "results" si c’est ton nom final
};

export function getStepPath(step: number | string | null | undefined): string {
  const s = Number(step) as StepId;
  return stepToPath[s] ?? stepToPath[1];
}

export function getPrevStepPath(step: number | string): string {
  const s = Math.max(1, Math.min(5, Number(step)));
  const prev = (s - 1) as StepId;
  return stepToPath[prev] ?? stepToPath[1];
}

export function getNextStepPath(step: number | string): string {
  const s = Math.max(1, Math.min(5, Number(step)));
  const next = (s + 1) as StepId;
  return stepToPath[next] ?? stepToPath[5];
}
