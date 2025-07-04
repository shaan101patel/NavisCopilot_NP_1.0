import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Phone, 
  Target, 
  ThumbsUp, 
  AlertCircle,
  Zap,
  Calendar,
  Activity,
  MessageSquare,
  Users,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  BarChart3,
  PieChart,
  Award,
  BookOpen,
  CheckCircle,
  XCircle,
  Pause,
  Filter
} from "lucide-react";
import { useState } from "react";

// IMPLEMENT LATER: Replace with real-time analytics data from backend (Supabase).
// Expected data structures for TODAY's metrics:
// - TodayMetrics: { 
//     callsHandled: number, 
//     avgCallDuration: number, 
//     ticketsClosed: number, 
//     avgResolutionTime: number,
//     customerSatisfaction: number,
//     scriptAdherence: number,
//     productivityScore: number
//   }
// - YesterdayComparison: { 
//     callsHandled: { today: number, yesterday: number, change: number },
//     avgCallDuration: { today: number, yesterday: number, change: number },
//     // ... same structure for all metrics
//   }
// - HourlyTrends: { hour: string, calls: number, tickets: number, satisfaction: number }[]
// - AIInsights: { type: 'positive' | 'warning' | 'info', message: string, actionable: boolean }[]
// - EfficiencyAlerts: { type: 'time' | 'quality' | 'volume', severity: 'low' | 'medium' | 'high', message: string }[]
// - QuickActions: { type: string, count: number, url: string, priority: 'low' | 'medium' | 'high' }[]

const mockTodayData = {
  // Today's Key Metrics
  today: {
    callsHandled: 23,
    avgCallDuration: 4.2, // minutes
    ticketsClosed: 18,
    avgResolutionTime: 2.1, // hours
    customerSatisfaction: 4.7,
    scriptAdherence: 92,
    productivityScore: 88,
    totalCallTime: 96.6, // minutes
    firstCallResolution: 85, // percentage
    escalationRate: 2.3, // percentage
  },

  // Yesterday's Metrics for Comparison
  yesterday: {
    callsHandled: 19,
    avgCallDuration: 4.8,
    ticketsClosed: 15,
    avgResolutionTime: 2.6,
    customerSatisfaction: 4.3,
    scriptAdherence: 87,
    productivityScore: 82,
    totalCallTime: 91.2,
    firstCallResolution: 78,
    escalationRate: 3.1,
  },

  // Hourly Trends for Today
  hourlyTrends: [
    { hour: "08:00", calls: 2, tickets: 1, satisfaction: 4.5, callDuration: 3.8 },
    { hour: "09:00", calls: 4, tickets: 3, satisfaction: 4.6, callDuration: 4.1 },
    { hour: "10:00", calls: 6, tickets: 4, satisfaction: 4.8, callDuration: 4.3 },
    { hour: "11:00", calls: 3, tickets: 2, satisfaction: 4.4, callDuration: 4.0 },
    { hour: "12:00", calls: 1, tickets: 1, satisfaction: 5.0, callDuration: 3.5 },
    { hour: "13:00", calls: 2, tickets: 2, satisfaction: 4.7, callDuration: 4.2 },
    { hour: "14:00", calls: 3, tickets: 3, satisfaction: 4.9, callDuration: 4.4 },
    { hour: "15:00", calls: 2, tickets: 2, satisfaction: 4.2, callDuration: 5.1 },
    { hour: "Current", calls: 0, tickets: 0, satisfaction: 0, callDuration: 0 }, // Live placeholder
  ],

  // AI-Powered Insights for Today
  aiInsights: [
    {
      type: "positive" as const,
      message: "You're resolving tickets 19% faster than your average today!",
      actionable: false,
      impact: "high"
    },
    {
      type: "warning" as const,
      message: "Customer sentiment dropped after 3PM - consider taking a short break",
      actionable: true,
      impact: "medium",
      action: "Take 10-minute break"
    },
    {
      type: "info" as const,
      message: "Your script adherence is at an all-time high today (92%)",
      actionable: false,
      impact: "low"
    },
    {
      type: "warning" as const,
      message: "Call duration increased by 12% in the last 2 hours",
      actionable: true,
      impact: "medium",
      action: "Review active listening techniques"
    },
  ],

  // Efficiency & Quality Alerts
  alerts: [
    {
      type: "quality" as const,
      severity: "low" as const,
      message: "Speech clarity score improved by 8% compared to yesterday",
      timestamp: "14:30",
      positive: true
    },
    {
      type: "time" as const,
      severity: "medium" as const,
      message: "Average call time is 15% above your optimal range",
      timestamp: "15:15",
      positive: false,
      suggestion: "Focus on concise problem identification"
    },
    {
      type: "volume" as const,
      severity: "low" as const,
      message: "On track to exceed daily call target by 20%",
      timestamp: "16:00",
      positive: true
    },
  ],

  // Quick Actions for Today
  quickActions: [
    {
      type: "Open Tickets",
      count: 3,
      url: "/tickets?status=open",
      priority: "high" as const,
      description: "Tickets requiring immediate attention"
    },
    {
      type: "Follow-up Calls",
      count: 2,
      url: "/calls?type=followup",
      priority: "medium" as const,
      description: "Scheduled follow-up calls"
    },
    {
      type: "Customer Feedback",
      count: 5,
      url: "/feedback?date=today",
      priority: "low" as const,
      description: "New customer feedback to review"
    },
    {
      type: "Escalated Issues",
      count: 1,
      url: "/tickets?escalated=true",
      priority: "high" as const,
      description: "Issues escalated to supervisor"
    },
  ],

  // Performance Summary
  summary: {
    whatWentWell: [
      "Exceeded daily call target by 21%",
      "Maintained high customer satisfaction (4.7/5)",
      "Perfect script adherence in opening segments",
      "Resolved complex billing issues efficiently"
    ],
    areasForImprovement: [
      "Call duration increased in afternoon sessions",
      "Missed 2 closing checklist items",
      "Could improve transition between call segments",
      "Customer sentiment dipped during peak hours"
    ],
    keyAchievements: [
      "Fastest resolution time this month",
      "Zero escalations before lunch",
      "Helped 3 customers upgrade services",
      "Received 2 positive feedback mentions"
    ]
  },

  // Real-time Status
  currentStatus: {
    isOnCall: false,
    lastCallEndTime: "15:45",
    nextScheduledBreak: "16:30",
    currentShiftProgress: 78, // percentage
    timeUntilShiftEnd: "2h 15m",
    activeTickets: 2,
    pendingTasks: 4
  }
};

export default function Today() {
  const [selectedDateFilter, setSelectedDateFilter] = useState("today");
  const [showDetailedTrends, setShowDetailedTrends] = useState(false);
  
  // IMPLEMENT LATER: Fetch today's real-time analytics data from backend
  // const { data: todayData, isLoading, error } = useTodayAnalytics();
  // const { data: comparisonData } = useYesterdayComparison();
  // const { data: liveData } = useLiveMetrics(); // WebSocket connection for real-time updates
  
  const data = mockTodayData;

  // Calculate percentage changes from yesterday
  const calculateChange = (todayValue: number, yesterdayValue: number): number => {
    return ((todayValue - yesterdayValue) / yesterdayValue) * 100;
  };

  const getChangeColor = (change: number): string => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  const getAlertColor = (severity: string): string => {
    switch (severity) {
      case "high": return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20";
      case "medium": return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20";
      case "low": return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20";
      default: return "border-border bg-card";
    }
  };

  const getPriorityColor = (priority: string): "default" | "success" | "warning" | "danger" | "info" => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "info";
      default: return "default";
    }
  };

  const renderMetricCard = (
    title: string,
    todayValue: string | number,
    yesterdayValue: number,
    icon: React.ReactNode,
    subtitle?: string,
    format?: "number" | "percentage" | "time" | "rating"
  ) => {
    const numericTodayValue = typeof todayValue === "string" ? parseFloat(todayValue) : todayValue;
    const change = calculateChange(numericTodayValue, yesterdayValue);
    const isPositive = change >= 0;
    
    return (
      <Card className="p-6 hover:shadow-lg transition-shadow bg-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{todayValue}</p>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="flex flex-col items-center">
            {icon}
            <div className={`flex items-center text-sm mt-2 font-medium ${getChangeColor(change)}`}>
              {isPositive ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
              {Math.abs(change).toFixed(1)}%
            </div>
            <span className="text-xs text-muted-foreground">vs yesterday</span>
          </div>
        </div>
      </Card>
    );
  };

  const renderTrendSparkline = (trends: typeof data.hourlyTrends, metric: string) => {
    // Simple ASCII-style sparkline for demonstration
    // IMPLEMENT LATER: Replace with actual charting library like Chart.js or Recharts
    const values = trends.slice(0, -1).map(trend => {
      switch (metric) {
        case "calls": return trend.calls;
        case "satisfaction": return trend.satisfaction;
        case "duration": return trend.callDuration;
        default: return 0;
      }
    });
    
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    return (
      <div className="flex items-end h-12 gap-1">
        {values.map((value, index) => {
          const height = max === min ? 50 : ((value - min) / (max - min)) * 100;
          return (
            <div
              key={index}
              className="bg-primary/60 rounded-sm flex-1"
              style={{ height: `${Math.max(height, 10)}%` }}
              title={`${trends[index].hour}: ${value}`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Today's Performance</h1>
          <p className="text-muted-foreground mt-2">
            Real-time insights for your calls, tickets, and customer satisfaction today
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${data.currentStatus.isOnCall ? 'bg-red-500' : 'bg-green-500'}`} />
              <span>{data.currentStatus.isOnCall ? 'On Call' : 'Available'}</span>
            </div>
            <div>Shift Progress: {data.currentStatus.currentShiftProgress}%</div>
            <div>Time Remaining: {data.currentStatus.timeUntilShiftEnd}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            {selectedDateFilter === "today" ? "Today" : "Custom Date"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowDetailedTrends(!showDetailedTrends)}
          >
            {showDetailedTrends ? "Hide Details" : "Show Details"}
          </Button>
        </div>
      </div>

      {/* Key Metrics for Today */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderMetricCard(
          "Total Calls Handled",
          data.today.callsHandled,
          data.yesterday.callsHandled,
          <Phone className="w-6 h-6 text-blue-500" />,
          "calls today"
        )}
        {renderMetricCard(
          "Average Call Duration",
          `${data.today.avgCallDuration}m`,
          data.yesterday.avgCallDuration,
          <Clock className="w-6 h-6 text-green-500" />,
          "per call"
        )}
        {renderMetricCard(
          "Tickets Closed",
          data.today.ticketsClosed,
          data.yesterday.ticketsClosed,
          <CheckCircle className="w-6 h-6 text-purple-500" />,
          "resolved today"
        )}
        {renderMetricCard(
          "Customer Satisfaction",
          data.today.customerSatisfaction.toFixed(1),
          data.yesterday.customerSatisfaction,
          <ThumbsUp className="w-6 h-6 text-orange-500" />,
          "avg rating"
        )}
      </div>

      {/* Additional Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderMetricCard(
          "Average Resolution Time",
          `${data.today.avgResolutionTime}h`,
          data.yesterday.avgResolutionTime,
          <Target className="w-6 h-6 text-indigo-500" />,
          "per ticket"
        )}
        {renderMetricCard(
          "Script Adherence",
          `${data.today.scriptAdherence}%`,
          data.yesterday.scriptAdherence,
          <BookOpen className="w-6 h-6 text-cyan-500" />,
          "compliance"
        )}
        {renderMetricCard(
          "Productivity Score",
          `${data.today.productivityScore}%`,
          data.yesterday.productivityScore,
          <Activity className="w-6 h-6 text-pink-500" />,
          "efficiency"
        )}
      </div>

      {/* Live Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Live Trends Throughout Today
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium mb-3 text-sm">Call Volume</h4>
            {renderTrendSparkline(data.hourlyTrends, "calls")}
            <p className="text-xs text-muted-foreground mt-2">Peak: 10:00-11:00 AM (6 calls)</p>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-sm">Customer Satisfaction</h4>
            {renderTrendSparkline(data.hourlyTrends, "satisfaction")}
            <p className="text-xs text-muted-foreground mt-2">Highest: 12:00 PM (5.0/5)</p>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-sm">Call Duration</h4>
            {renderTrendSparkline(data.hourlyTrends, "duration")}
            <p className="text-xs text-muted-foreground mt-2">Shortest: 12:00 PM (3.5m)</p>
          </div>
        </div>
        
        {showDetailedTrends && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-medium mb-3">Hourly Breakdown</h4>
            <div className="space-y-2">
              {data.hourlyTrends.slice(0, -1).map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm font-medium">{trend.hour}</span>
                  <div className="flex gap-6 text-sm">
                    <span>{trend.calls} calls</span>
                    <span>{trend.tickets} tickets</span>
                    <span>{trend.satisfaction.toFixed(1)}/5 satisfaction</span>
                    <span>{trend.callDuration.toFixed(1)}m avg duration</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* AI-Powered Insights for Today */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          AI-Powered Insights for Today
        </h3>
        <div className="space-y-3">
          {data.aiInsights.map((insight, index) => (
            <div key={index} className={`flex items-start gap-3 p-4 rounded-lg border ${
              insight.type === "positive" ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" :
              insight.type === "warning" ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20" :
              "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
            }`}>
              <div className="flex-shrink-0 mt-0.5">
                {insight.type === "positive" && <CheckCircle className="w-5 h-5 text-green-500" />}
                {insight.type === "warning" && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                {insight.type === "info" && <Zap className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{insight.message}</p>
                {insight.actionable && insight.action && (
                  <Button size="sm" variant="outline" className="mt-2">
                    {insight.action}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
              <Badge variant={insight.impact === "high" ? "danger" : insight.impact === "medium" ? "warning" : "info"} size="sm">
                {insight.impact}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Efficiency & Quality Alerts */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Efficiency & Quality Alerts
        </h3>
        <div className="space-y-3">
          {data.alerts.map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getAlertColor(alert.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {alert.type === "time" && <Clock className="w-4 h-4" />}
                    {alert.type === "quality" && <Award className="w-4 h-4" />}
                    {alert.type === "volume" && <BarChart3 className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    {alert.suggestion && (
                      <p className="text-xs text-muted-foreground mt-1">💡 {alert.suggestion}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={alert.positive ? "success" : "warning"} size="sm">
                    {alert.severity}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-500" />
          Quick Actions for Today
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => {
                // IMPLEMENT LATER: Navigate to appropriate page/section
                console.log(`Navigate to: ${action.url}`);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium text-sm">{action.type}</span>
                <Badge variant={getPriorityColor(action.priority)} size="sm">
                  {action.count}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground text-left">{action.description}</p>
              <ArrowRight className="w-4 h-4 self-end" />
            </Button>
          ))}
        </div>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What Went Well Today */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            What Went Well Today
          </h3>
          <div className="space-y-3">
            {data.summary.whatWentWell.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Areas for Improvement */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            Areas for Improvement
          </h3>
          <div className="space-y-3">
            {data.summary.areasForImprovement.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Key Achievements */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-500" />
          Key Achievements Today
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.summary.keyAchievements.map((achievement, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Award className="w-5 h-5 text-purple-500" />
              <p className="text-sm font-medium">{achievement}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Optional Date Picker for Historical Comparison */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Historical Comparison (Coming Soon)
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">
              Compare today's performance with any previous date
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                <Calendar className="w-4 h-4 mr-2" />
                Select Date
              </Button>
              <Button variant="outline" size="sm" disabled>
                Last Week
              </Button>
              <Button variant="outline" size="sm" disabled>
                Last Month
              </Button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              IMPLEMENT LATER
            </p>
            <p className="text-xs text-muted-foreground">
              Date picker and historical data
            </p>
          </div>
        </div>
      </Card>

      {/* Real-time Status Footer */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${data.currentStatus.isOnCall ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="font-medium">
                {data.currentStatus.isOnCall ? 'Currently on call' : 'Available for calls'}
              </span>
            </div>
            <span>•</span>
            <span>Last call ended: {data.currentStatus.lastCallEndTime}</span>
            <span>•</span>
            <span>Next break: {data.currentStatus.nextScheduledBreak}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span>{data.currentStatus.activeTickets} active tickets</span>
            <span>•</span>
            <span>{data.currentStatus.pendingTasks} pending tasks</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
