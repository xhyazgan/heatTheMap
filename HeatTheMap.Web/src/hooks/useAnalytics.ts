import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';

export const useDailySummary = (storeId: number | null, date: string) => {
  return useQuery({
    queryKey: ['dailySummary', storeId, date],
    queryFn: () => analyticsService.getDailySummary(storeId!, date),
    enabled: !!storeId,
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useWeeklyTrends = (storeId: number | null, startDate: string) => {
  return useQuery({
    queryKey: ['weeklyTrends', storeId, startDate],
    queryFn: () => analyticsService.getWeeklyTrends(storeId!, startDate),
    enabled: !!storeId,
    staleTime: 300000, // 5 minutes
  });
};

export const useHourlyDistribution = (storeId: number | null, date: string) => {
  return useQuery({
    queryKey: ['hourlyDistribution', storeId, date],
    queryFn: () => analyticsService.getHourlyDistribution(storeId!, date),
    enabled: !!storeId,
  });
};

export const useZonePerformance = (
  storeId: number | null,
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: ['zonePerformance', storeId, startDate, endDate],
    queryFn: () => analyticsService.getZonePerformance(storeId!, startDate, endDate),
    enabled: !!storeId,
  });
};

export const usePeakHours = (storeId: number | null, days: number = 7) => {
  return useQuery({
    queryKey: ['peakHours', storeId, days],
    queryFn: () => analyticsService.getPeakHours(storeId!, days),
    enabled: !!storeId,
  });
};

export const useStores = () => {
  return useQuery({
    queryKey: ['stores'],
    queryFn: () => analyticsService.getStores(),
    staleTime: Infinity, // Stores rarely change
  });
};
