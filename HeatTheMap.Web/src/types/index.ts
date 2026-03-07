// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  username: string;
}

// Store types
export interface Store {
  id: number;
  name: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  floorArea: number;
  createdAt: string;
  isActive: boolean;
}

// Analytics types
export interface DailySummary {
  todayVisitors: number;
  averageStayDuration: number;
  peakHour: number;
  weeklyChangePercent: number;
  currentOccupancy: number;
}

export interface DailyDataPoint {
  date: string;
  totalVisitors: number;
  peakOccupancy: number;
}

export interface WeeklyTrends {
  dailyData: DailyDataPoint[];
  weekOverWeekChange: number;
  totalVisitors: number;
}

export interface HourlyDistribution {
  hourlyEntries: Record<number, number>;
  hourlyExits: Record<number, number>;
  peakHour: number;
  peakCount: number;
}

export interface HotZone {
  zoneName: string;
  visitCount: number;
  percentage: number;
}

export interface ColdZone {
  zoneName: string;
  visitCount: number;
  percentage: number;
}

export interface ZonePerformance {
  zoneVisits: Record<string, number>;
  hotZones: HotZone[];
  coldZones: ColdZone[];
}

export interface PeakHourData {
  hour: number;
  visitorCount: number;
  timeRange: string;
}

export interface PeakHours {
  peakHours: PeakHourData[];
  averagePeakDuration: string;
}

// Chat types
export interface ChatRequest {
  query: string;
  storeId: number;
}

export interface ChatResponse {
  message: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Heatmap grid data from API
export interface HeatmapGridData {
  zoneMatrix: number[][];
  gridWidth: number;
  gridHeight: number;
  maxDensity: number;
  timestamp: string;
}

// Detection types
export interface DetectionSubmission {
  storeId: number;
  timestamp: string;
  personCount: number;
  exitCount: number;
  zoneDistribution?: number[][];
}

// Entry Line types
export interface EntryLineConfig {
  id: number;
  storeId: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  inDirection: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateEntryLine {
  storeId: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  inDirection: string;
}

export interface UpdateEntryLine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  inDirection: string;
  isActive: boolean;
}
