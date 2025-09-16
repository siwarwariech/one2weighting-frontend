// src/hooks/useCurrentStep.ts
import { useLocation } from "react-router-dom";

export const useCurrentStep = (): number => {
  const location = useLocation();
  
  const getCurrentStepFromPath = (pathname: string): number => {
    if (pathname.includes('upload')) return 1;
    if (pathname.includes('variables')) return 2;
    if (pathname.includes('targets')) return 3;
    if (pathname.includes('weighting')) return 4;
    if (pathname.includes('rapport-weighted')) return 5;
    return 1;
  };

  return getCurrentStepFromPath(location.pathname);
};