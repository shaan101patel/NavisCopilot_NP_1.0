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
  PieChart,
  Activity,
  Award,
  BookOpen,
  Zap
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

export default function Analytics() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  
  // IMPLEMENT LATER: Fetch analytics and performance data from backend (Supabase).
  const data = mockAnalyticsData;

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
    subtitle?: string
  ) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
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
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
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
        {["overview", "efficiency", "performance", "quality", "trends"].map((tab) => (
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
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderMetricCard(
              "Total Calls",
              data.userPerformance.individual.callsHandled,
              <Phone className="w-6 h-6 text-blue-500" />,
              12
            )}
            {renderMetricCard(
              "Avg Resolution Time",
              `${data.efficiency.avgCallDuration}m`,
              <Clock className="w-6 h-6 text-green-500" />,
              -8
            )}
            {renderMetricCard(
              "Customer Satisfaction",
              data.satisfaction.overall,
              <ThumbsUp className="w-6 h-6 text-purple-500" />,
              data.satisfaction.trend * 10
            )}
            {renderMetricCard(
              "Productivity Score",
              `${data.efficiency.productivityScore}%`,
              <Target className="w-6 h-6 text-orange-500" />,
              5
            )}
          </div>

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
                    agent.name === "You" ? "bg-blue-50 border border-blue-200" : "bg-muted/50"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        agent.rank === 1 ? "bg-yellow-500 text-white" :
                        agent.rank === 2 ? "bg-gray-400 text-white" :
                        agent.rank === 3 ? "bg-orange-500 text-white" :
                        "bg-gray-200 text-gray-600"
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

      {/* Efficiency Tab */}
      {activeTab === "efficiency" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderMetricCard(
              "Avg Call Duration",
              `${data.efficiency.avgCallDuration}m`,
              <Clock className="w-6 h-6 text-blue-500" />,
              -12,
              "Target: 4.0m"
            )}
            {renderMetricCard(
              "Time Per Ticket",
              `${data.efficiency.timePerTicket}m`,
              <Target className="w-6 h-6 text-green-500" />,
              -5,
              "Target: 10.0m"
            )}
            {renderMetricCard(
              "Time to Resolution",
              `${data.efficiency.timeToResolution}h`,
              <Activity className="w-6 h-6 text-purple-500" />,
              -18,
              "Target: 2.0h"
            )}
          </div>

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
    </div>
  );
}
