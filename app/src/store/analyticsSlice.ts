import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CallMetrics {
  totalCalls: number;
  averageCallDuration: number;
  callsToday: number;
  callsThisWeek: number;
  callsThisMonth: number;
  resolutionRate: number;
  averageWaitTime: number;
}

interface SentimentAnalysis {
  positive: number;
  neutral: number;
  negative: number;
  trend: 'improving' | 'stable' | 'declining';
}

interface AgentPerformance {
  agentId: string;
  agentName: string;
  callsHandled: number;
  averageRating: number;
  resolutionRate: number;
  averageCallDuration: number;
  scriptAdherence: number;
}

interface ScriptAdherence {
  overallScore: number;
  topPerformingScripts: string[];
  improvementAreas: string[];
  complianceRate: number;
}

interface DashboardMetrics {
  callMetrics: CallMetrics;
  sentimentAnalysis: SentimentAnalysis;
  agentPerformance: AgentPerformance[];
  scriptAdherence: ScriptAdherence;
  timeRange: '24h' | '7d' | '30d' | '90d';
  lastUpdated: string;
}

interface AnalyticsState {
  dashboardMetrics: DashboardMetrics | null;
  detailedReports: any[]; // For future detailed analytics reports
  loading: boolean;
  error: string | null;
  selectedTimeRange: '24h' | '7d' | '30d' | '90d';
  autoRefresh: boolean;
}

const initialState: AnalyticsState = {
  dashboardMetrics: null,
  detailedReports: [],
  loading: false,
  error: null,
  selectedTimeRange: '7d',
  autoRefresh: true,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setDashboardMetrics(state, action: PayloadAction<DashboardMetrics>) {
      state.dashboardMetrics = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateCallMetrics(state, action: PayloadAction<Partial<CallMetrics>>) {
      if (state.dashboardMetrics) {
        state.dashboardMetrics.callMetrics = {
          ...state.dashboardMetrics.callMetrics,
          ...action.payload
        };
      }
    },
    updateSentimentAnalysis(state, action: PayloadAction<Partial<SentimentAnalysis>>) {
      if (state.dashboardMetrics) {
        state.dashboardMetrics.sentimentAnalysis = {
          ...state.dashboardMetrics.sentimentAnalysis,
          ...action.payload
        };
      }
    },
    updateAgentPerformance(state, action: PayloadAction<AgentPerformance[]>) {
      if (state.dashboardMetrics) {
        state.dashboardMetrics.agentPerformance = action.payload;
      }
    },
    updateScriptAdherence(state, action: PayloadAction<Partial<ScriptAdherence>>) {
      if (state.dashboardMetrics) {
        state.dashboardMetrics.scriptAdherence = {
          ...state.dashboardMetrics.scriptAdherence,
          ...action.payload
        };
      }
    },
    setSelectedTimeRange(state, action: PayloadAction<AnalyticsState['selectedTimeRange']>) {
      state.selectedTimeRange = action.payload;
      if (state.dashboardMetrics) {
        state.dashboardMetrics.timeRange = action.payload;
      }
    },
    setAutoRefresh(state, action: PayloadAction<boolean>) {
      state.autoRefresh = action.payload;
    },
    setDetailedReports(state, action: PayloadAction<any[]>) {
      state.detailedReports = action.payload;
    },
    addDetailedReport(state, action: PayloadAction<any>) {
      state.detailedReports.push(action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearError(state) {
      state.error = null;
    },
    refreshMetrics(state) {
      state.loading = true;
      state.error = null;
      if (state.dashboardMetrics) {
        state.dashboardMetrics.lastUpdated = new Date().toISOString();
      }
    },
  },
});

export const {
  setDashboardMetrics,
  updateCallMetrics,
  updateSentimentAnalysis,
  updateAgentPerformance,
  updateScriptAdherence,
  setSelectedTimeRange,
  setAutoRefresh,
  setDetailedReports,
  addDetailedReport,
  setLoading,
  setError,
  clearError,
  refreshMetrics,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
