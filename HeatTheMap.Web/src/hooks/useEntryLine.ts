import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entryLineService } from '../services/entryline.service';
import type { CreateEntryLine } from '../types';

export const useEntryLine = (storeId: number | null) => {
  return useQuery({
    queryKey: ['entryLine', storeId],
    queryFn: () => entryLineService.getByStoreId(storeId!),
    enabled: !!storeId,
    staleTime: Infinity,
  });
};

export const useSaveEntryLine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEntryLine) => entryLineService.create(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['entryLine', result.storeId] });
    },
  });
};
