import api from './api';
import type {
  DailySummary,
  WeeklyTrends,
  HourlyDistribution,
  ZonePerformance,
  PeakHours,
  Store,
  HeatmapGridData,
  DetectionSubmission,
} from '../types';

export const analyticsService = {
  async getDailySummary(storeId: number, date: string): Promise<DailySummary> {
    const response = await api.get<DailySummary>('/api/analytics/daily-summary', {
      params: { storeId, date },
    });
    return response.data;
  },

  async getWeeklyTrends(storeId: number, startDate: string): Promise<WeeklyTrends> {
    const response = await api.get<WeeklyTrends>('/api/analytics/weekly-trends', {
      params: { storeId, startDate },
    });
    return response.data;
  },

  async getHourlyDistribution(
    storeId: number,
    date: string
  ): Promise<HourlyDistribution> {
    const response = await api.get<HourlyDistribution>(
      '/api/analytics/hourly-distribution',
      {
        params: { storeId, date },
      }
    );
    return response.data;
  },

  async getZonePerformance(
    storeId: number,
    startDate: string,
    endDate: string
  ): Promise<ZonePerformance> {
    const response = await api.get<ZonePerformance>('/api/analytics/zone-performance', {
      params: { storeId, startDate, endDate },
    });
    return response.data;
  },

  async getPeakHours(storeId: number, days: number = 7): Promise<PeakHours> {
    const response = await api.get<PeakHours>('/api/analytics/peak-hours', {
      params: { storeId, days },
    });
    return response.data;
  },

  async getStores(): Promise<Store[]> {
    const response = await api.get<Store[]>('/api/stores');
    return response.data;
  },

  async getLatestHeatmap(storeId: number): Promise<HeatmapGridData> {
    const response = await api.get<HeatmapGridData>('/api/analytics/heatmap/latest', {
      params: { storeId },
    });
    return response.data;
  },

  async submitDetection(data: DetectionSubmission): Promise<void> {
    await api.post('/api/analytics/detection', data);
  },
};
