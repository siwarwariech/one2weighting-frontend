// src/hooks/useProjectNavigation.ts
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';

export function useProjectNavigation() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!projectId) return;

    const determineRedirect = async () => {
      try {
        const response = await api.get<{ redirect_to: string }>(
          `/projects/${projectId}/redirect-target`
        );
        
        // Validate the route exists
        const validRoutes = ['upload', 'variables', 'targets', 'weighting', 'report'];
        if (!validRoutes.includes(response.data.redirect_to)) {
          throw new Error('Invalid route received');
        }

        navigate(`/project/${projectId}/${response.data.redirect_to}`, {
          replace: true  // Prevent back navigation to loading state
        });
        
      } catch (error) {
        console.error('Redirect error:', error);
        // Fallback to project dashboard if error occurs
        navigate(`/dashboard/project/${projectId}`, {
          state: { error: 'Could not determine next step' }
        });
      }
    };

    determineRedirect();
  }, [projectId, navigate]);
} 