import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import clsx from "clsx";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Phone, 
  Target, 
  MessageSquare, 
  ThumbsUp, 
  AlertCircle,
  Download,
  Filter,
  Calendar,
  BarChart3,
  Info,
  PieChart,
  Activity,
  Award,
  BookOpen,
  Zap,
  X,
  Maximize2,
  Calendar as CalendarIcon,
  ArrowDown,
  ArrowUp,
  HelpCircle
} from "lucide-react";
import { useState } from "react";

// IMPLEMENT LATER: Replace with real analytics data from backend (Supabase).
// Expected data structures:
// - EfficiencyMetrics: { avgCallDuration: number, timePerTicket: number, timeToResolution: number }
// - UserPerformance: { agentId: string, name: string, metrics: {...}, teamAverage: {...} }
// - SpeechAnalysis: { clarity: number, consistency: number, speed: number, adherence: number }
// - TimeSeriesData: { date: string, calls: number, duration: number, satisfaction: number }[]
// - ScriptAdherence: { adherenceRate: number, missedPoints: string[], suggestions: string[] }
// - SentimentScores: { positive: number, neutral: number, negative: number, trend: number }
// - ComparativeData: { individual: {...}, team: {...}, company: {...} }

const mockAnalyticsData = {
  // Efficiency Analysis
  efficiency: {
    avgCallDuration: 4.5, // minutes
    timePerTicket: 12.3, // minutes
    timeToResolution: 2.8, // hours
    productivityScore: 87,
    timeWasted: 8.2, // percentage
    peakHours: ["10:00-11:00", "14:00-15:00"],
  },
  
  // User Analytics
  userPerformance: {
    individual: {
      name: "John Doe",
      callsHandled: 124,
      avgResolutionTime: 4.2,
      customerSatisfaction: 4.6,
      scriptAdherence: 89,
      rank: 3,
      totalAgents: 15,
    },
    team: {
      avgCallsHandled: 98,
      avgResolutionTime: 5.1,
      avgSatisfaction: 4.2,
      avgAdherence: 85,
    },
    improvements: [
      "Reduce call duration by 15% through better questioning techniques",
      "Improve script adherence in greeting and closing segments",
      "Focus on active listening to reduce repeat explanations",
    ],
  },
  
  // Speech Analysis
  speechAnalysis: {
    clarity: 92,
    consistency: 88,
    speed: 85, // words per minute score
    tone: 87,
    professionalismScore: 91,
    suggestions: [
      "Slow down during technical explanations",
      "Use more empathetic language for frustrated customers",
      "Maintain consistent energy throughout longer calls",
    ],
  },
  
  // Time Series Data
  timeSeriesData: [
    { date: "2025-06-24", calls: 18, duration: 4.2, satisfaction: 4.3, resolution: 85 },
    { date: "2025-06-25", calls: 22, duration: 4.8, satisfaction: 4.1, resolution: 87 },
    { date: "2025-06-26", calls: 19, duration: 4.1, satisfaction: 4.5, resolution: 92 },
    { date: "2025-06-27", calls: 28, duration: 4.9, satisfaction: 4.2, resolution: 88 },
    { date: "2025-06-28", calls: 17, duration: 3.8, satisfaction: 4.7, resolution: 94 },
    { date: "2025-06-29", calls: 25, duration: 4.3, satisfaction: 4.4, resolution: 89 },
    { date: "2025-06-30", calls: 23, duration: 4.1, satisfaction: 4.6, resolution: 91 },
  ],
  
  // Script Adherence
  scriptAdherence: {
    overallRate: 89,
    greeting: 95,
    problemIdentification: 87,
    solutionPresentation: 91,
    closing: 82,
    missedPoints: ["Forgot to mention warranty info", "Skipped satisfaction survey"],
    topPerformers: ["Alice Johnson (97%)", "Bob Smith (94%)"],
  },
  
  // Customer Satisfaction
  satisfaction: {
    overall: 4.5,
    trend: 0.3, // positive increase
    distribution: { 5: 45, 4: 35, 3: 15, 2: 3, 1: 2 },
    byCallType: {
      "Technical Support": 4.2,
      "Billing": 4.6,
      "General Inquiry": 4.7,
      "Complaint": 3.9,
    },
  },
  
  // Sentiment Analysis
  sentiment: {
    positive: 68,
    neutral: 25,
    negative: 7,
    trend: 12, // percentage improvement
    avgSentimentScore: 0.72, // -1 to 1 scale
    emotionalResolution: 89, // percentage of calls ending positively
  },
  
  // Comparative Analytics
  comparative: {
    callVolume: { you: 124, team: 98, company: 87 },
    resolution: { you: 91, team: 88, company: 85 },
    satisfaction: { you: 4.6, team: 4.2, company: 4.1 },
    adherence: { you: 89, team: 85, company: 82 },
  },
  
  // Leaderboard Data
  leaderboard: [
    { name: "Alice Johnson", score: 97, calls: 142, satisfaction: 4.8, rank: 1 },
    { name: "Bob Smith", score: 94, calls: 138, satisfaction: 4.7, rank: 2 },
    { name: "You", score: 91, calls: 124, satisfaction: 4.6, rank: 3 },
    { name: "Carol Davis", score: 88, calls: 119, satisfaction: 4.4, rank: 4 },
    { name: "David Wilson", score: 85, calls: 115, satisfaction: 4.3, rank: 5 },
  ],
  
  // Training Recommendations
  trainingRecommendations: [
    { 
      title: "Advanced De-escalation Techniques", 
      priority: "high", 
      estimatedTime: "2 hours",
      reason: "Low sentiment scores in complaint calls"
    },
    { 
      title: "Technical Product Knowledge", 
      priority: "medium", 
      estimatedTime: "3 hours",
      reason: "Longer resolution times for technical issues"
    },
    { 
      title: "Script Adherence Training", 
      priority: "medium", 
      estimatedTime: "1 hour",
      reason: "Missing closing checklist items"
    },
  ],
};

// IMPLEMENT LATER: Time series data structures for detailed graphs
// Expected backend integration for metric trending:
interface MetricTimeSeriesData {
  date: string;
  value: number;
  teamAverage?: number;
  companyAverage?: number;
  events?: {
    type: 'spike' | 'drop' | 'improvement' | 'concern';
    description: string;
    impact: 'high' | 'medium' | 'low';
  }[];
}

// IMPLEMENT LATER: Backend API endpoints for detailed metric data
// - GET /api/analytics/metrics/total-calls/timeseries?range=7d&agentId=current
// - GET /api/analytics/metrics/resolution-score/timeseries?range=30d&agentId=current
// - GET /api/analytics/metrics/satisfaction/timeseries?range=90d&agentId=current
// - GET /api/analytics/metrics/productivity/timeseries?range=7d&agentId=current
// - GET /api/analytics/metrics/call-duration/timeseries?range=30d&agentId=current
// - GET /api/analytics/metrics/ticket-time/timeseries?range=7d&agentId=current
// - GET /api/analytics/metrics/resolution-time/timeseries?range=30d&agentId=current

// Mock time series data for detailed metric graphs
const mockTimeSeriesData = {
  totalCalls: [
    { date: "2025-06-24", value: 18, teamAverage: 16, companyAverage: 15 },
    { date: "2025-06-25", value: 22, teamAverage: 17, companyAverage: 16 },
    { date: "2025-06-26", value: 19, teamAverage: 18, companyAverage: 17 },
    { date: "2025-06-27", value: 28, teamAverage: 19, companyAverage: 18, events: [{ type: 'spike', description: 'High call volume due to system outage', impact: 'high' }] },
    { date: "2025-06-28", value: 17, teamAverage: 16, companyAverage: 15 },
    { date: "2025-06-29", value: 25, teamAverage: 18, companyAverage: 17 },
    { date: "2025-06-30", value: 23, teamAverage: 19, companyAverage: 18 },
  ],
  resolutionScore: [
    { date: "2025-06-24", value: 85, teamAverage: 82, companyAverage: 80 },
    { date: "2025-06-25", value: 87, teamAverage: 83, companyAverage: 81 },
    { date: "2025-06-26", value: 92, teamAverage: 85, companyAverage: 82, events: [{ type: 'improvement', description: 'Completed advanced training module', impact: 'medium' }] },
    { date: "2025-06-27", value: 88, teamAverage: 84, companyAverage: 81 },
    { date: "2025-06-28", value: 94, teamAverage: 86, companyAverage: 83 },
    { date: "2025-06-29", value: 89, teamAverage: 85, companyAverage: 82 },
    { date: "2025-06-30", value: 91, teamAverage: 86, companyAverage: 83 },
  ],
  satisfaction: [
    { date: "2025-06-24", value: 4.3, teamAverage: 4.1, companyAverage: 4.0 },
    { date: "2025-06-25", value: 4.1, teamAverage: 4.0, companyAverage: 3.9 },
    { date: "2025-06-26", value: 4.5, teamAverage: 4.2, companyAverage: 4.1 },
    { date: "2025-06-27", value: 4.2, teamAverage: 4.1, companyAverage: 4.0 },
    { date: "2025-06-28", value: 4.7, teamAverage: 4.3, companyAverage: 4.2 },
    { date: "2025-06-29", value: 4.4, teamAverage: 4.2, companyAverage: 4.1 },
    { date: "2025-06-30", value: 4.6, teamAverage: 4.3, companyAverage: 4.2 },
  ],
  productivityScore: [
    { date: "2025-06-24", value: 82, teamAverage: 78, companyAverage: 75 },
    { date: "2025-06-25", value: 85, teamAverage: 80, companyAverage: 77 },
    { date: "2025-06-26", value: 88, teamAverage: 82, companyAverage: 79 },
    { date: "2025-06-27", value: 84, teamAverage: 81, companyAverage: 78 },
    { date: "2025-06-28", value: 90, teamAverage: 84, companyAverage: 81 },
    { date: "2025-06-29", value: 87, teamAverage: 83, companyAverage: 80 },
    { date: "2025-06-30", value: 89, teamAverage: 85, companyAverage: 82 },
  ],
  callDuration: [
    { date: "2025-06-24", value: 4.2, teamAverage: 4.8, companyAverage: 5.2 },
    { date: "2025-06-25", value: 4.8, teamAverage: 5.1, companyAverage: 5.5 },
    { date: "2025-06-26", value: 4.1, teamAverage: 4.9, companyAverage: 5.3 },
    { date: "2025-06-27", value: 4.9, teamAverage: 5.2, companyAverage: 5.6, events: [{ type: 'spike', description: 'Complex technical issues during system outage', impact: 'high' }] },
    { date: "2025-06-28", value: 3.8, teamAverage: 4.6, companyAverage: 5.0, events: [{ type: 'improvement', description: 'Improved questioning techniques', impact: 'medium' }] },
    { date: "2025-06-29", value: 4.3, teamAverage: 4.9, companyAverage: 5.3 },
    { date: "2025-06-30", value: 4.1, teamAverage: 4.8, companyAverage: 5.2 },
  ],
  timePerTicket: [
    { date: "2025-06-24", value: 12.8, teamAverage: 14.2, companyAverage: 15.5 },
    { date: "2025-06-25", value: 13.5, teamAverage: 14.8, companyAverage: 16.1 },
    { date: "2025-06-26", value: 11.9, teamAverage: 13.8, companyAverage: 15.2 },
    { date: "2025-06-27", value: 14.1, teamAverage: 15.5, companyAverage: 16.8 },
    { date: "2025-06-28", value: 10.8, teamAverage: 13.2, companyAverage: 14.6 },
    { date: "2025-06-29", value: 12.5, teamAverage: 14.1, companyAverage: 15.4 },
    { date: "2025-06-30", value: 11.7, teamAverage: 13.6, companyAverage: 15.0 },
  ],
  timeToResolution: [
    { date: "2025-06-24", value: 2.9, teamAverage: 3.2, companyAverage: 3.8 },
    { date: "2025-06-25", value: 3.1, teamAverage: 3.4, companyAverage: 4.0 },
    { date: "2025-06-26", value: 2.6, teamAverage: 3.0, companyAverage: 3.6 },
    { date: "2025-06-27", value: 3.3, teamAverage: 3.6, companyAverage: 4.2 },
    { date: "2025-06-28", value: 2.4, teamAverage: 2.8, companyAverage: 3.4, events: [{ type: 'improvement', description: 'Faster escalation process', impact: 'medium' }] },
    { date: "2025-06-29", value: 2.8, teamAverage: 3.1, companyAverage: 3.7 },
    { date: "2025-06-30", value: 2.7, teamAverage: 3.0, companyAverage: 3.6 },
  ],
};

export default function Analytics() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState("7d");
  
  // IMPLEMENT LATER: Fetch analytics and performance data from backend (Supabase).
  const data = mockAnalyticsData;

  // Calculate agent's personal averages for today's performance comparison
  const calculateAgentAverages = () => {
    // Calculate agent's historical averages from time series data (excluding today)
    const historicalData = mockTimeSeriesData.totalCalls.slice(0, -1); // Exclude today's data
    const totalCallsAvg = historicalData.reduce((sum, d) => sum + d.value, 0) / historicalData.length;
    
    const callDurationHistorical = mockTimeSeriesData.callDuration.slice(0, -1);
    const callDurationAvg = callDurationHistorical.reduce((sum, d) => sum + d.value, 0) / callDurationHistorical.length;
    
    const satisfactionHistorical = mockTimeSeriesData.satisfaction.slice(0, -1);
    const satisfactionAvg = satisfactionHistorical.reduce((sum, d) => sum + d.value, 0) / satisfactionHistorical.length;
    
    const resolutionHistorical = mockTimeSeriesData.resolutionScore.slice(0, -1);
    const resolutionAvg = resolutionHistorical.reduce((sum, d) => sum + d.value, 0) / resolutionHistorical.length;
    
    return {
      totalCalls: Math.round(totalCallsAvg),
      callDuration: Math.round(callDurationAvg * 10) / 10,
      satisfaction: Math.round(satisfactionAvg * 10) / 10,
      resolution: Math.round(resolutionAvg)
    };
  };

  const agentAverages = calculateAgentAverages();

  const exportData = () => {
    // IMPLEMENT LATER: Export analytics data to CSV/Excel
    // Expected functionality:
    // - Generate CSV/Excel files with current analytics data
    // - Include filters applied (date range, agent, etc.)
    // - Format data for spreadsheet applications
    // - Provide download link or save to cloud storage
    
    const csvData = [
      ['Metric', 'Value', 'Trend', 'Target'],
      ['Total Calls', data.userPerformance.individual.callsHandled, '+12%', '120'],
      ['Avg Resolution Time', `${data.efficiency.avgCallDuration}m`, '-8%', '4.0m'],
      ['Customer Satisfaction', data.satisfaction.overall, `+${data.satisfaction.trend * 10}%`, '4.5'],
      ['Script Adherence', `${data.scriptAdherence.overallRate}%`, '+5%', '90%'],
      // Add more metrics as needed
    ];
    
    console.log("Exporting analytics data:", csvData);
    // In real implementation, convert to CSV and trigger download
    alert("Analytics data export functionality will be implemented with backend integration");
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    change?: number,
    subtitle?: string,
    onClick?: () => void
  ) => (
    <Card 
      className={`p-6 transition-all duration-200 ${
        onClick ? 'hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-primary/50' : 'hover:shadow-lg'
      }`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={onClick ? `View detailed ${title} analytics` : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-center">
          {icon}
          {change !== undefined && (
            <div className={`flex items-center text-sm mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(change)}%
            </div>
          )}
          {onClick && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <BarChart3 className="w-3 h-3 mr-1" />
              View Details
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  const renderDetailedMetricModal = () => {
    if (!selectedMetric) return null;

    const getMetricData = () => {
      switch (selectedMetric) {
        case 'totalCalls':
          return {
            title: 'Total Calls',
            data: mockTimeSeriesData.totalCalls,
            unit: 'calls',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500',
            description: 'Number of calls handled over time',
            insights: activeTab === 'today' ? [
              'Today: 23 calls vs your average of 20 calls (+15%)',
              'Strong performance - above your personal average',
              'Peak productivity achieved during mid-morning hours'
            ] : [
              'Peak performance on June 29th with 25 calls',
              'Consistent above-team performance',
              'System outage on June 27th caused spike in call volume'
            ]
          };
        case 'resolutionScore':
          return {
            title: 'Average Resolution Score',
            data: mockTimeSeriesData.resolutionScore,
            unit: '%',
            color: 'text-green-500',
            bgColor: 'bg-green-500',
            description: 'Percentage of issues resolved successfully',
            insights: activeTab === 'today' ? [
              'Today: 91% resolution vs your average of 87% (+4.6%)',
              'Excellent performance above personal baseline',
              'Effective use of new resolution techniques'
            ] : [
              'Highest score of 94% on June 28th',
              'Consistent improvement after training',
              'Performing above team and company averages'
            ]
          };
        case 'satisfaction':
          return {
            title: 'Customer Satisfaction',
            data: mockTimeSeriesData.satisfaction,
            unit: '/5',
            color: 'text-purple-500',
            bgColor: 'bg-purple-500',
            description: 'Average customer satisfaction rating',
            insights: activeTab === 'today' ? [
              'Today: 4.7 rating vs your average of 4.3 (+9.3%)',
              'Outstanding customer feedback today',
              'Improved empathy and active listening showing results'
            ] : [
              'Excellent performance with 4.7 rating on June 28th',
              'Consistently exceeding team expectations',
              'Strong upward trend in customer feedback'
            ]
          };
        case 'productivityScore':
          return {
            title: 'Productivity Score',
            data: mockTimeSeriesData.productivityScore,
            unit: '%',
            color: 'text-orange-500',
            bgColor: 'bg-orange-500',
            description: 'Overall productivity rating based on multiple factors',
            insights: activeTab === 'today' ? [
              'Today: 89% productivity vs your average of 85% (+4.7%)',
              'Efficient workflow and time management',
              'Optimal balance of speed and quality achieved'
            ] : [
              'Peak productivity of 90% on June 28th',
              'Strong performance above team average',
              'Consistent improvement over time'
            ]
          };
        case 'callDuration':
          return {
            title: 'Average Call Duration',
            data: mockTimeSeriesData.callDuration,
            unit: 'min',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500',
            description: 'Average duration of calls handled',
            insights: activeTab === 'today' ? [
              'Today: 4.1 min vs your average of 4.4 min (-6.8%)',
              'Faster resolution times showing efficiency gains',
              'Improved questioning techniques reducing call duration'
            ] : [
              'Excellent efficiency with 3.8 min average on June 28th',
              'Significantly below team average (faster resolution)',
              'Improved questioning techniques reducing call time'
            ]
          };
        case 'timePerTicket':
          return {
            title: 'Time Per Ticket',
            data: mockTimeSeriesData.timePerTicket,
            unit: 'min',
            color: 'text-green-500',
            bgColor: 'bg-green-500',
            description: 'Average time spent per ticket',
            insights: activeTab === 'today' ? [
              'Today: 11.7 min vs your average of 12.5 min (-6.4%)',
              'Improved efficiency in ticket processing',
              'Better workflow organization contributing to faster resolution'
            ] : [
              'Best performance of 10.8 min on June 28th',
              'Consistently faster than team average',
              'Efficient ticket processing and resolution'
            ]
          };
        case 'timeToResolution':
          return {
            title: 'Time to Resolution',
            data: mockTimeSeriesData.timeToResolution,
            unit: 'hours',
            color: 'text-purple-500',
            bgColor: 'bg-purple-500',
            description: 'Average time to resolve issues',
            insights: activeTab === 'today' ? [
              'Today: 2.7 hours vs your average of 2.9 hours (-6.9%)',
              'Faster issue resolution than personal baseline',
              'Effective escalation and follow-up processes'
            ] : [
              'Fastest resolution of 2.4 hours on June 28th',
              'Significantly faster than team and company averages',
              'Improved escalation process contributing to faster resolution'
            ]
          };
        default:
          return null;
      }
    };

    const metricData = getMetricData();
    if (!metricData) return null;

    const maxValue = Math.max(...metricData.data.map(d => Math.max(d.value, d.teamAverage || 0, d.companyAverage || 0)));
    const minValue = Math.min(...metricData.data.map(d => Math.min(d.value, d.teamAverage || 0, d.companyAverage || 0)));

    // IMPLEMENT LATER: Export graph data functionality
    const exportGraphData = () => {
      // Expected functionality:
      // - Generate CSV with time series data
      // - Include all comparison data (team, company averages)
      // - Add event annotations
      // - Format for spreadsheet applications
      
      const csvData = [
        ['Date', 'Your Value', 'Team Average', 'Company Average', 'Events'],
        ...metricData.data.map(d => [
          d.date,
          d.value,
          d.teamAverage || '',
          d.companyAverage || '',
          (d as any).events?.map((e: any) => `${e.type}: ${e.description}`).join('; ') || ''
        ])
      ];
      
      console.log("Exporting graph data:", csvData);
      // In real implementation, convert to CSV and trigger download
      alert(`${metricData.title} data export functionality will be implemented with backend integration`);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${metricData.color.replace('text-', 'bg-')}/10`}>
                <BarChart3 className={`w-6 h-6 ${metricData.color}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">{metricData.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {metricData.description}
                  {activeTab === 'today' && (
                    <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                      Today vs Your Average
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {selectedDateRange === '7d' ? 'Last 7 days' : 
                     selectedDateRange === '30d' ? 'Last 30 days' : 
                     'Last 90 days'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedDateRange("7d")}>Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedDateRange("30d")}>Last 30 days</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedDateRange("90d")}>Last 90 days</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={exportGraphData} className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedMetric(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Chart Area */}
            <div className="mb-6">
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                {/* IMPLEMENT LATER: Replace with actual charting library like Chart.js, Recharts, or D3.js */}
                <div className="text-center text-muted-foreground mb-4">
                  <p className="text-sm">Interactive Chart Placeholder</p>
                  <p className="text-xs">IMPLEMENT LATER: Replace with Chart.js, Recharts, or D3.js</p>
                </div>
                
                {/* Simple SVG visualization placeholder */}
                <div className="w-full h-64 bg-background rounded border relative overflow-hidden">
                  <svg width="100%" height="100%" className="absolute inset-0">
                    {/* Grid lines */}
                    {[...Array(5)].map((_, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={`${20 + i * 15}%`}
                        x2="100%"
                        y2={`${20 + i * 15}%`}
                        stroke="currentColor"
                        strokeOpacity="0.1"
                        className="text-muted-foreground"
                      />
                    ))}
                    
                    {/* Simple line chart representation */}
                    <polyline
                      points={metricData.data.map((d, i) => 
                        `${10 + (i * 80) / (metricData.data.length - 1)},${90 - ((d.value - minValue) / (maxValue - minValue)) * 60}`
                      ).join(' ')}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className={metricData.color}
                    />
                    
                    {/* Team average line */}
                    {metricData.data[0].teamAverage && (
                      <polyline
                        points={metricData.data.map((d, i) => 
                          `${10 + (i * 80) / (metricData.data.length - 1)},${90 - ((d.teamAverage! - minValue) / (maxValue - minValue)) * 60}`
                        ).join(' ')}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        className="text-muted-foreground"
                        opacity="0.7"
                      />
                    )}
                    
                    {/* Data points */}
                    {metricData.data.map((d, i) => (
                      <circle
                        key={i}
                        cx={`${10 + (i * 80) / (metricData.data.length - 1)}%`}
                        cy={`${90 - ((d.value - minValue) / (maxValue - minValue)) * 60}%`}
                        r="4"
                        fill="currentColor"
                        className={metricData.color}
                      />
                    ))}
                  </svg>
                  
                  {/* Legend */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className={`w-3 h-0.5 ${metricData.bgColor}`}></div>
                      <span>Your Performance</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-muted-foreground opacity-70" style={{ borderTop: '2px dashed' }}></div>
                      <span>
                        {activeTab === 'today' ? 'Your Average' : 'Team Average'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                  Hover over data points for detailed information • Click and drag to zoom
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Compare
                  </Button>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Recent Data Points
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {metricData.data.slice(-7).reverse().map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                      <span>{new Date(d.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{d.value}{metricData.unit}</span>
                        {d.teamAverage && (
                          <span className="text-muted-foreground">
                            ({activeTab === 'today' ? 'Avg' : 'Team'}: {d.teamAverage}{metricData.unit})
                          </span>
                        )}
                        {(d as any).events && (d as any).events.length > 0 && (
                          <Info className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  AI-Generated Insights
                  {activeTab === 'today' && (
                    <Badge variant="default" className="ml-2">
                      Personal Analysis
                    </Badge>
                  )}
                </h3>
                <div className="space-y-2">
                  {metricData.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
                
                {/* IMPLEMENT LATER: AI-generated recommendations */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>IMPLEMENT LATER:</strong> {activeTab === 'today' 
                      ? 'AI-generated personal recommendations based on today\'s performance patterns and historical trends will appear here.'
                      : 'AI-generated recommendations based on metric trends, performance patterns, and predictive analytics will appear here.'
                    }
                  </p>
                </div>
              </Card>
            </div>

            {/* Events and Annotations */}
            {metricData.data.some(d => (d as any).events && (d as any).events.length > 0) && (
              <Card className="p-4 mt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Key Events & Annotations
                </h3>
                <div className="space-y-2">
                  {metricData.data.flatMap(d => 
                    (d as any).events?.map((event: any) => ({
                      ...event,
                      date: d.date,
                      value: d.value
                    })) || []
                  ).map((event: any, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        event.type === 'spike' ? 'bg-red-500' :
                        event.type === 'drop' ? 'bg-orange-500' :
                        event.type === 'improvement' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm capitalize">{event.type}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        <Badge 
                          variant={event.impact === 'high' ? 'danger' : event.impact === 'medium' ? 'warning' : 'default'}
                          className="mt-2"
                        >
                          {event.impact} impact
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Beta Feature Disclaimer */}
      <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
        <Info size={20} className="text-orange-600 dark:text-orange-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Coming Soon:</strong> This Analytics feature is planned for implementation in the 1.0 release. 
            All data currently displayed is mock data, and the final interface may differ from what you see now.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered insights for agent performance and customer satisfaction
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedTimeRange("7d")}>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedTimeRange("30d")}>Last 30 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedTimeRange("90d")}>Last 90 days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={exportData} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b">
        {["overview", "today", "efficiency", "performance", "quality", "trends"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics - Now Interactive */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderMetricCard(
              "Total Calls",
              data.userPerformance.individual.callsHandled,
              <Phone className="w-6 h-6 text-blue-500" />,
              12,
              undefined,
              () => setSelectedMetric('totalCalls')
            )}
            {renderMetricCard(
              "Avg Resolution Score",
              `${data.efficiency.avgCallDuration}m`,
              <Clock className="w-6 h-6 text-green-500" />,
              -8,
              undefined,
              () => setSelectedMetric('resolutionScore')
            )}
            {renderMetricCard(
              "Customer Satisfaction",
              data.satisfaction.overall,
              <ThumbsUp className="w-6 h-6 text-purple-500" />,
              data.satisfaction.trend * 10,
              undefined,
              () => setSelectedMetric('satisfaction')
            )}
            {renderMetricCard(
              "Productivity Score",
              `${data.efficiency.productivityScore}%`,
              <Target className="w-6 h-6 text-orange-500" />,
              5,
              undefined,
              () => setSelectedMetric('productivityScore')
            )}
          </div>

          {/* Interactive Guide */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800 dark:text-blue-200">Interactive Analytics</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Click on any metric card above to view detailed time-series analysis, compare with team averages, 
              and access AI-generated insights. Use the date range filters to explore historical trends.
            </p>
          </Card>

          {/* Performance Comparison */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance vs Team Average</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Call Volume</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="text-2xl font-bold">{data.comparative.callVolume.you}</div>
                  <div className="text-sm text-muted-foreground">vs {data.comparative.callVolume.team}</div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="text-2xl font-bold">{data.comparative.resolution.you}%</div>
                  <div className="text-sm text-muted-foreground">vs {data.comparative.resolution.team}%</div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="text-2xl font-bold">{data.comparative.satisfaction.you}</div>
                  <div className="text-sm text-muted-foreground">vs {data.comparative.satisfaction.team}</div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Script Adherence</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="text-2xl font-bold">{data.comparative.adherence.you}%</div>
                  <div className="text-sm text-muted-foreground">vs {data.comparative.adherence.team}%</div>
                </div>
              </div>
            </div>
          </Card>

          {/* AI Insights */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              AI-Powered Insights
            </h3>
            <div className="space-y-3">
              {data.userPerformance.improvements.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Team Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-gold-500" />
                Team Leaderboard
              </h3>
              <div className="space-y-3">
                {data.leaderboard.map((agent, index) => (
                  <div key={index} className={clsx(
                    "flex items-center justify-between p-3 rounded-lg",
                    agent.name === "You" 
                      ? "bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-700" 
                      : "bg-muted/50"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        agent.rank === 1 ? "bg-yellow-500 text-white" :
                        agent.rank === 2 ? "bg-gray-400 text-white" :
                        agent.rank === 3 ? "bg-orange-500 text-white" :
                        "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      )}>
                        {agent.rank}
                      </div>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.calls} calls</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{agent.score}</p>
                      <p className="text-sm text-muted-foreground">★ {agent.satisfaction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Training Recommendations */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                Recommended Training
              </h3>
              <div className="space-y-3">
                {data.trainingRecommendations.map((training, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{training.title}</h4>
                      <Badge 
                        variant={training.priority === "high" ? "danger" : training.priority === "medium" ? "warning" : "info"}
                        size="sm"
                      >
                        {training.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{training.reason}</p>
                    <p className="text-xs text-muted-foreground">Est. time: {training.estimatedTime}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Today Tab */}
      {activeTab === "today" && (
        <div className="space-y-6">
          {/* Today's Performance Overview - Now Interactive */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Today's Performance - {new Date().toLocaleDateString()}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderMetricCard(
                "Calls Today",
                23,
                <Phone className="w-6 h-6 text-blue-500" />,
                Math.round(((23 - agentAverages.totalCalls) / agentAverages.totalCalls) * 100),
                "vs your average",
                () => setSelectedMetric('totalCalls')
              )}
              {renderMetricCard(
                "Avg Call Duration",
                "4.1m",
                <Clock className="w-6 h-6 text-green-500" />,
                Math.round(((4.1 - agentAverages.callDuration) / agentAverages.callDuration) * 100),
                "vs your average",
                () => setSelectedMetric('callDuration')
              )}
              {renderMetricCard(
                "Customer Satisfaction",
                "4.7",
                <ThumbsUp className="w-6 h-6 text-purple-500" />,
                Math.round(((4.7 - agentAverages.satisfaction) / agentAverages.satisfaction) * 100),
                "vs your average",
                () => setSelectedMetric('satisfaction')
              )}
              {renderMetricCard(
                "Tickets Resolved",
                18,
                <Target className="w-6 h-6 text-orange-500" />,
                Math.round(((18 - agentAverages.resolution) / agentAverages.resolution) * 100),
                "vs your average",
                () => setSelectedMetric('resolutionScore')
              )}
            </div>
          </Card>

          {/* Interactive Guide for Today Tab */}
          <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-800 dark:text-purple-200">Today's Detailed Analytics</span>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Click on any metric above to view detailed graphs and insights comparing today's performance 
              with your personal historical averages. Identify trends and optimization opportunities for continuous improvement.
            </p>
          </Card>

          {/* Real-time Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Live Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Currently on call</span>
                  </div>
                  <span className="text-sm text-green-600">12:34 elapsed</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm">Last call completed</span>
                    <span className="text-sm text-muted-foreground">2 mins ago</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm">Next scheduled break</span>
                    <span className="text-sm text-muted-foreground">in 45 mins</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Today's Achievements
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium text-sm">Fastest Resolution</p>
                    <p className="text-xs text-muted-foreground">Resolved ticket in 1.8 minutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <ThumbsUp className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">High Satisfaction</p>
                    <p className="text-xs text-muted-foreground">5-star rating from customer</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <Target className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">Goal Achieved</p>
                    <p className="text-xs text-muted-foreground">Exceeded daily call target</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Today's Schedule and Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Schedule
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Shift Start</span>
                  <span className="text-sm font-medium">9:00 AM</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Lunch Break</span>
                  <span className="text-sm font-medium">1:00 PM</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Shift End</span>
                  <span className="text-sm font-medium">5:00 PM</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Daily Goals
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Calls Target</span>
                    <span className="font-medium">23/25</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Satisfaction Target</span>
                    <span className="font-medium">4.7/4.5</span>
                  </div>
                  <Progress value={104} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Resolution Target</span>
                    <span className="font-medium">18/20</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Priority Tasks
              </h3>
              <div className="space-y-2">
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Follow up: Ticket #1234</p>
                  <p className="text-xs text-red-600 dark:text-red-400">Due: 2:00 PM</p>
                </div>
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Team meeting</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">3:30 PM</p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Training module</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">End of day</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Call Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              Recent Calls Summary
            </h3>
            <div className="space-y-3">
              {/* IMPLEMENT LATER: Replace with real call data from backend */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Technical Support - Ticket #5678</span>
                  <Badge variant="success">Resolved</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Duration: 3.2 minutes • Customer: John Smith</p>
                  <p>Issue: Password reset • Satisfaction: ⭐⭐⭐⭐⭐</p>
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Billing Inquiry - Ticket #5679</span>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Duration: 5.1 minutes • Customer: Jane Doe</p>
                  <p>Issue: Billing dispute • Follow-up required</p>
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">General Inquiry - Ticket #5680</span>
                  <Badge variant="success">Resolved</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Duration: 2.8 minutes • Customer: Mike Johnson</p>
                  <p>Issue: Account information • Satisfaction: ⭐⭐⭐⭐⭐</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Efficiency Tab */}
      {activeTab === "efficiency" && (
        <div className="space-y-6">
          {/* Interactive Efficiency Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderMetricCard(
              "Avg Call Duration",
              `${data.efficiency.avgCallDuration}m`,
              <Clock className="w-6 h-6 text-blue-500" />,
              -12,
              "Target: 4.0m",
              () => setSelectedMetric('callDuration')
            )}
            {renderMetricCard(
              "Time Per Ticket",
              `${data.efficiency.timePerTicket}m`,
              <Target className="w-6 h-6 text-green-500" />,
              -5,
              "Target: 10.0m",
              () => setSelectedMetric('timePerTicket')
            )}
            {renderMetricCard(
              "Time to Resolution",
              `${data.efficiency.timeToResolution}h`,
              <Activity className="w-6 h-6 text-purple-500" />,
              -18,
              "Target: 2.0h",
              () => setSelectedMetric('timeToResolution')
            )}
          </div>

          {/* Interactive Guide for Efficiency */}
          <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">Efficiency Analytics</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Click on efficiency metrics to view detailed trends, compare with team benchmarks, 
              and identify optimization opportunities. Each graph includes AI-generated insights for improvement.
            </p>
          </Card>

          {/* Peak Hours Analysis */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Peak Performance Hours</h3>
            <div className="space-y-2">
              {data.efficiency.peakHours.map((hour, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span>{hour}</span>
                  <span className="text-sm text-green-600 font-medium">Peak Efficiency</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Time Waste Analysis */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Time Optimization Opportunities</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Time Wasted</span>
                <span className="text-2xl font-bold text-red-500">{data.efficiency.timeWasted}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${data.efficiency.timeWasted}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Main causes: Long hold times, system delays, incomplete information gathering
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* Individual Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Individual Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Your Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Calls Handled</span>
                    <span className="font-semibold">{data.userPerformance.individual.callsHandled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resolution Time</span>
                    <span className="font-semibold">{data.userPerformance.individual.avgResolutionTime}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Satisfaction</span>
                    <span className="font-semibold">{data.userPerformance.individual.customerSatisfaction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Team Rank</span>
                    <span className="font-semibold">#{data.userPerformance.individual.rank} of {data.userPerformance.individual.totalAgents}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Team Average</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Calls Handled</span>
                    <span className="font-semibold">{data.userPerformance.team.avgCallsHandled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resolution Time</span>
                    <span className="font-semibold">{data.userPerformance.team.avgResolutionTime}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Satisfaction</span>
                    <span className="font-semibold">{data.userPerformance.team.avgSatisfaction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Script Adherence</span>
                    <span className="font-semibold">{data.userPerformance.team.avgAdherence}%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Speech Analysis */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Speech Quality Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{data.speechAnalysis.clarity}%</div>
                <p className="text-sm text-muted-foreground">Clarity</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{data.speechAnalysis.consistency}%</div>
                <p className="text-sm text-muted-foreground">Consistency</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{data.speechAnalysis.speed}%</div>
                <p className="text-sm text-muted-foreground">Speaking Speed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{data.speechAnalysis.tone}%</div>
                <p className="text-sm text-muted-foreground">Tone</p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Speech Improvement Suggestions</h4>
              <ul className="space-y-1 text-sm">
                {data.speechAnalysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      )}

      {/* Quality Tab */}
      {activeTab === "quality" && (
        <div className="space-y-6">
          {/* Script Adherence */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Script Adherence Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-500">{data.scriptAdherence.overallRate}%</div>
                  <p className="text-sm text-muted-foreground">Overall Adherence</p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Greeting</span>
                      <span className="font-semibold">{data.scriptAdherence.greeting}%</span>
                    </div>
                    <Progress value={data.scriptAdherence.greeting} color="success" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Problem ID</span>
                      <span className="font-semibold">{data.scriptAdherence.problemIdentification}%</span>
                    </div>
                    <Progress value={data.scriptAdherence.problemIdentification} color="warning" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Solution</span>
                      <span className="font-semibold">{data.scriptAdherence.solutionPresentation}%</span>
                    </div>
                    <Progress value={data.scriptAdherence.solutionPresentation} color="success" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Closing</span>
                      <span className="font-semibold text-red-500">{data.scriptAdherence.closing}%</span>
                    </div>
                    <Progress value={data.scriptAdherence.closing} color="danger" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Areas for Improvement</h4>
                <ul className="space-y-2 text-sm">
                  {data.scriptAdherence.missedPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Sentiment Analysis */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Sentiment Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Sentiment Distribution</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="flex-1">Positive</span>
                    <span className="font-semibold">{data.sentiment.positive}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="flex-1">Neutral</span>
                    <span className="font-semibold">{data.sentiment.neutral}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="flex-1">Negative</span>
                    <span className="font-semibold">{data.sentiment.negative}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Sentiment Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Avg Sentiment Score</span>
                    <span className="font-semibold">{data.sentiment.avgSentimentScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emotional Resolution</span>
                    <span className="font-semibold">{data.sentiment.emotionalResolution}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trend</span>
                    <span className="font-semibold text-green-500">+{data.sentiment.trend}%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Customer Satisfaction */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Satisfaction Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">By Call Type</h4>
                <div className="space-y-2">
                  {Object.entries(data.satisfaction.byCallType).map(([type, rating]) => (
                    <div key={type} className="flex justify-between">
                      <span>{type}</span>
                      <span className="font-semibold">{rating}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Rating Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(data.satisfaction.distribution).map(([stars, count]) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="w-8">{stars}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${count}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{count}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === "trends" && (
        <div className="space-y-6">
          {/* IMPLEMENT LATER: Replace with actual charting library like Chart.js or Recharts */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Trends (Last 7 Days)</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Calls</p>
                  <p className="text-2xl font-bold">{data.timeSeriesData[data.timeSeriesData.length - 1].calls}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold">{data.timeSeriesData[data.timeSeriesData.length - 1].duration}m</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Satisfaction</p>
                  <p className="text-2xl font-bold">{data.timeSeriesData[data.timeSeriesData.length - 1].satisfaction}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resolution</p>
                  <p className="text-2xl font-bold">{data.timeSeriesData[data.timeSeriesData.length - 1].resolution}%</p>
                </div>
              </div>
              
              {/* Simple trend visualization */}
              <div className="space-y-2">
                <h4 className="font-medium">Daily Breakdown</h4>
                {data.timeSeriesData.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="text-sm">{day.date}</span>
                    <div className="flex gap-4 text-sm">
                      <span>Calls: {day.calls}</span>
                      <span>Duration: {day.duration}m</span>
                      <span>Satisfaction: {day.satisfaction}</span>
                      <span>Resolution: {day.resolution}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Custom Analytics Widgets */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Custom Analytics Widgets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Widget 1: Escalation Rate */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Escalation Rate</h4>
                <div className="text-2xl font-bold text-orange-500">3.2%</div>
                <p className="text-sm text-muted-foreground">↓ 12% from last week</p>
                <Progress value={3.2} max={10} color="warning" className="mt-2" />
              </div>

              {/* Widget 2: First Call Resolution */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">First Call Resolution</h4>
                <div className="text-2xl font-bold text-green-500">87%</div>
                <p className="text-sm text-muted-foreground">↑ 8% from last week</p>
                <Progress value={87} color="success" className="mt-2" />
              </div>

              {/* Widget 3: Average Hold Time */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Avg Hold Time</h4>
                <div className="text-2xl font-bold text-blue-500">1.3m</div>
                <p className="text-sm text-muted-foreground">↓ 18% from last week</p>
                <Progress value={13} max={60} color="default" className="mt-2" />
              </div>
            </div>
            
            {/* IMPLEMENT LATER: Add widget customization controls */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Coming Soon:</strong> Drag-and-drop widget customization, add/remove widgets, 
                resize panels, and save custom dashboard layouts.
              </p>
            </div>
          </Card>

          {/* Advanced Analytics Preview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Advanced Analytics (Preview)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Call Pattern Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Peak Call Hours</span>
                    <span className="font-semibold">10:00-11:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Most Common Issues</span>
                    <span className="font-semibold">Billing (32%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Call Queue Time</span>
                    <span className="font-semibold">45 seconds</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Predictive Insights</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Projected Weekly Volume</span>
                    <span className="font-semibold">890 calls</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Burnout Risk Score</span>
                    <span className="font-semibold text-green-500">Low (2/10)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skill Gap Priority</span>
                    <span className="font-semibold">De-escalation</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Render Modal */}
      {renderDetailedMetricModal()}
    </div>
  );
}
