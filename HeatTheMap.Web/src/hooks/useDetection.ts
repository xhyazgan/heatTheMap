import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';
import type { DetectionSubmission } from '../types';

export const useSubmitDetection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DetectionSubmission) => analyticsService.submitDetection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestHeatmap'] });
      queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
      queryClient.invalidateQueries({ queryKey: ['hourlyDistribution'] });
    },
  });
};
