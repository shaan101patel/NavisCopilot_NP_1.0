import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import clsx from "clsx";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Phone, 
  Target, 
  MessageSquare, 
  ThumbsUp, 
  AlertCircle,
  CheckCircle,
  Award,
  BookOpen,
  Zap,
  Star,
  Info,
  ArrowRight,
  BarChart3,
  Users,
  Brain,
  Lightbulb,
  ChevronDown,
  PlayCircle,
  Volume2,
  FileText,
  Calendar,
  Eye,
  Headphones,
  Mic,
  Heart,
  Activity,
  Search,
  Filter,
  X
} from "lucide-react";
import { useState } from "react";

// Filter and search types
type CallType = "All" | "Billing Issue" | "Technical Support" | "Product Inquiry" | "Account Update" | "Complaint";
type ResolutionStatus = "All" | "Resolved" | "Escalated" | "Pending";
type SentimentFilter = "All" | "Positive" | "Neutral" | "Negative";

interface CallFilters {
  type: CallType;
  resolution: ResolutionStatus;
  sentiment: SentimentFilter;
  dateRange: string;
}

// IMPLEMENT LATER: Replace with real data from backend (Supabase).
// Expected data structures:
// - AgentMetrics: { callEfficiency: number, resolutionSpeed: number, scriptAdherence: number, customerSentiment: number, speechClarity: number }
// - RecommendationItem: { id: string, title: string, description: string, priority: "high" | "medium" | "low", category: string, estimatedImpact: string }
// - CallData: { id: string, date: string, duration: number, customerName: string, type: string, sentiment: number, transcript: string, analysis: CallAnalysis }
// - CallAnalysis: { scriptAdherence: number, sentimentScore: number, efficiencyRating: number, speechMetrics: SpeechMetrics, suggestions: string[] }
// - SpeechMetrics: { clarity: number, consistency: number, speed: number, volume: number, tone: number }
// - ProgressMetrics: { metric: string, currentValue: number, previousValue: number, trend: "up" | "down", improvement: string }

const mockAgentData = {
  // Agent's Personal Analytics Summary
  personalMetrics: {
    callEfficiency: 87,
    resolutionSpeed: 92,
    scriptAdherence: 84,
    customerSentiment: 89,
    speechClarity: 91,
    overallScore: 89,
    rank: 3,
    totalAgents: 15,
    improvement: {
      lastWeek: 5,
      lastMonth: 12,
      trend: "up"
    }
  },

  // Strengths and Areas for Improvement
  strengths: [
    { area: "Customer Empathy", score: 94, description: "Excellent at understanding customer emotions" },
    { area: "Product Knowledge", score: 91, description: "Strong grasp of technical solutions" },
    { area: "Problem Resolution", score: 89, description: "Efficient at solving complex issues" }
  ],

  improvementAreas: [
    { area: "Script Adherence", score: 84, description: "Occasional deviations from closing procedures" },
    { area: "Call Duration", score: 78, description: "Average call time above team target" },
    { area: "Follow-up Consistency", score: 82, description: "Inconsistent post-call documentation" }
  ],

  // AI-Generated Actionable Recommendations
  recommendations: [
    {
      id: "1",
      title: "Shorten Greeting Scripts",
      description: "Your greeting averages 45 seconds. Try reducing to 30 seconds by removing redundant pleasantries.",
      priority: "high",
      category: "Efficiency",
      estimatedImpact: "15% faster call starts",
      actions: [
        "Use 'Thank you for calling, I'm [Name], how can I help?' instead of longer greetings",
        "Skip weather/small talk unless customer initiates",
        "Jump directly to problem identification"
      ]
    },
    {
      id: "2", 
      title: "Improve Closing Statement Clarity",
      description: "Analysis shows 23% of your calls end without clear next steps communicated to customers.",
      priority: "high",
      category: "Communication",
      estimatedImpact: "20% better customer satisfaction",
      actions: [
        "Always summarize the solution provided",
        "Clearly state any follow-up actions required",
        "Ask 'Is there anything else I can help you with today?'"
      ]
    },
    {
      id: "3",
      title: "Follow Up Within 1 Hour",
      description: "Your follow-up response time averages 2.3 hours. Faster responses improve resolution rates.",
      priority: "medium",
      category: "Efficiency",
      estimatedImpact: "25% faster ticket resolution",
      actions: [
        "Set 30-minute reminders for follow-ups",
        "Use templated responses for common issues",
        "Prioritize callbacks over email when possible"
      ]
    },
    {
      id: "4",
      title: "Enhance Active Listening Techniques",
      description: "Customers repeat information 1.8 times per call on average. Better listening reduces repetition.",
      priority: "medium",
      category: "Communication",
      estimatedImpact: "30% shorter call duration",
      actions: [
        "Paraphrase customer concerns back to them",
        "Ask clarifying questions before providing solutions",
        "Take notes during the call, not just after"
      ]
    }
  ],

  // Recent Call Data for Selection
  recentCalls: [
    {
      id: "call_001",
      date: "2025-07-03",
      time: "14:30",
      duration: 6.5,
      customerName: "Sarah Johnson",
      type: "Billing Issue",
      sentiment: 0.3,
      resolution: "Resolved",
      satisfaction: 4.2
    },
    {
      id: "call_002",
      date: "2025-07-03",
      time: "11:15",
      duration: 4.2,
      customerName: "Michael Chen",
      type: "Technical Support",
      sentiment: 0.7,
      resolution: "Resolved",
      satisfaction: 4.8
    },
    {
      id: "call_003",
      date: "2025-07-02",
      time: "16:45",
      duration: 8.3,
      customerName: "Lisa Rodriguez",
      type: "Product Inquiry",
      sentiment: 0.1,
      resolution: "Escalated",
      satisfaction: 3.5
    },
    {
      id: "call_004",
      date: "2025-07-02",
      time: "10:20",
      duration: 3.8,
      customerName: "James Wilson",
      type: "Account Update",
      sentiment: 0.8,
      resolution: "Resolved",
      satisfaction: 4.9
    },
    {
      id: "call_005",
      date: "2025-07-01",
      time: "15:30",
      duration: 5.7,
      customerName: "Emma Davis",
      type: "Complaint",
      sentiment: -0.2,
      resolution: "Resolved",
      satisfaction: 4.1
    }
  ],

  // Detailed Call Analysis (for selected call)
  callAnalysis: {
    call_001: {
      transcript: "Agent: Thank you for calling Navis Support, this is John, how can I help you today?\nCustomer: Hi, I'm calling about my bill. I was charged twice for the same service...",
      transcriptSummary: "Customer complained about duplicate billing charges. Agent investigated, found system error, processed refund, and apologized for inconvenience. Call resolved successfully.",
      
      scriptAdherence: {
        overall: 78,
        greeting: 90,
        problemIdentification: 85,
        solutionPresentation: 75,
        closing: 65,
        missedElements: [
          "Did not mention case number during closing",
          "Skipped satisfaction survey",
          "Forgot to mention estimated refund timeframe"
        ]
      },
      
      sentimentAnalysis: {
        initial: -0.6,
        final: 0.3,
        improvement: 0.9,
        customerEmotions: ["frustrated", "confused", "relieved", "satisfied"],
        agentTone: "professional",
        empathyScore: 85
      },
      
      efficiencyMetrics: {
        timeSpent: 6.5,
        timeWasted: 1.2,
        optimalTime: 5.0,
        bottlenecks: [
          "Long hold time while checking billing system (90 seconds)",
          "Repeated explanation of refund process (45 seconds)"
        ],
        strengths: [
          "Quick problem identification",
          "Efficient system navigation",
          "Clear solution explanation"
        ]
      },
      
      speechMetrics: {
        clarity: 88,
        consistency: 85,
        speed: 145, // words per minute
        volume: 92,
        tone: 87,
        professionalismScore: 91,
        fillerWords: 12,
        upspeak: 3 // instances of ending statements as questions
      },
      
      specificSuggestions: [
        "Practice clearer enunciation of technical terms like 'billing cycle' and 'proration'",
        "Reduce speaking speed slightly during technical explanations (currently 145 WPM, target 130 WPM)",
        "Use more confident tone when explaining solutions - avoid uptalk",
        "Implement better hold procedures - explain what you're doing",
        "Follow complete closing checklist to avoid missed elements"
      ],
      
      customerSatisfaction: {
        score: 4.2,
        feedback: "Agent was helpful and resolved my issue, but I had to wait a while during the call.",
        improvements: "Could have been faster and more thorough with the closing"
      }
    }
  } as { [key: string]: any },

  // Progress Tracking Over Time
  progressMetrics: [
    {
      metric: "Average Call Duration",
      currentValue: 5.2,
      previousValue: 6.5,
      unit: "minutes",
      trend: "down",
      improvement: "20% faster",
      isPositive: true
    },
    {
      metric: "Script Adherence",
      currentValue: 84,
      previousValue: 78,
      unit: "%",
      trend: "up", 
      improvement: "6 points higher",
      isPositive: true
    },
    {
      metric: "Customer Satisfaction",
      currentValue: 4.6,
      previousValue: 4.3,
      unit: "stars",
      trend: "up",
      improvement: "0.3 point increase",
      isPositive: true
    },
    {
      metric: "First Call Resolution",
      currentValue: 91,
      previousValue: 87,
      unit: "%",
      trend: "up",
      improvement: "4 points higher",
      isPositive: true
    }
  ],

  // Achievement Badges
  achievements: [
    {
      title: "Speed Demon",
      description: "Reduced average call time by 20% this week",
      icon: "⚡",
      dateEarned: "2025-07-01",
      isNew: true
    },
    {
      title: "Customer Champion",
      description: "Achieved 4.5+ satisfaction rating for 5 consecutive days",
      icon: "🏆",
      dateEarned: "2025-06-28",
      isNew: false
    },
    {
      title: "Script Master",
      description: "Maintained 90%+ script adherence for 2 weeks",
      icon: "📝",
      dateEarned: "2025-06-25",
      isNew: false
    }
  ]
};

export default function AgentImprovement() {
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CallFilters>({
    type: "All",
    resolution: "All",
    sentiment: "All",
    dateRange: "All"
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // IMPLEMENT LATER: Fetch agent performance data, recommendations, and call details from backend (Supabase).
  const data = mockAgentData;

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.5) return "text-green-600 bg-green-100";
    if (sentiment > 0) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.5) return "Positive";
    if (sentiment > 0) return "Neutral";
    return "Negative";
  };

  const getSentimentFromNumber = (sentiment: number): SentimentFilter => {
    if (sentiment > 0.5) return "Positive";
    if (sentiment > 0) return "Neutral";
    return "Negative";
  };

  // Filter and search logic
  const filteredCalls = data.recentCalls.filter(call => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Type filter
    const matchesType = filters.type === "All" || call.type === filters.type;

    // Resolution filter
    const matchesResolution = filters.resolution === "All" || call.resolution === filters.resolution;

    // Sentiment filter
    const callSentiment = getSentimentFromNumber(call.sentiment);
    const matchesSentiment = filters.sentiment === "All" || callSentiment === filters.sentiment;

    // Date filter (simple implementation for demo)
    const matchesDate = filters.dateRange === "All" || 
      (filters.dateRange === "Today" && call.date === "2025-07-03") ||
      (filters.dateRange === "Yesterday" && call.date === "2025-07-02") ||
      (filters.dateRange === "This Week" && ["2025-07-03", "2025-07-02", "2025-07-01"].includes(call.date));

    return matchesSearch && matchesType && matchesResolution && matchesSentiment && matchesDate;
  });

  const clearFilters = () => {
    setFilters({
      type: "All",
      resolution: "All",
      sentiment: "All",
      dateRange: "All"
    });
    setSearchTerm("");
  };

  const hasActiveFilters = searchTerm !== "" || 
    filters.type !== "All" || 
    filters.resolution !== "All" || 
    filters.sentiment !== "All" || 
    filters.dateRange !== "All";

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    if (score >= 70) return "text-orange-600";
    return "text-red-600";
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    score?: number,
    description?: string
  ) => (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="flex flex-col items-center">
          {icon}
          {score !== undefined && (
            <div className="mt-2">
              <Progress value={score} className="w-12 h-2" />
              <p className={`text-xs mt-1 ${getScoreColor(score)}`}>{score}%</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Beta Feature Disclaimer */}
      <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
        <Info size={20} className="text-orange-600 dark:text-orange-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Coming Soon:</strong> This Agent Improvement feature is planned for implementation in the 1.0 release. 
            All data currently displayed is mock data, and the final interface may differ from what you see now.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-heading">Agent Improvement</h1>
        <p className="text-muted-foreground">
          Personalized feedback and recommendations to help you perform better
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b">
        {["overview", "recommendations", "call-analysis", "progress"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderMetricCard(
              "Overall Performance",
              `${data.personalMetrics.overallScore}%`,
              <Activity className="w-6 h-6 text-blue-500" />,
              data.personalMetrics.overallScore,
              `Rank #${data.personalMetrics.rank} of ${data.personalMetrics.totalAgents}`
            )}
            {renderMetricCard(
              "Call Efficiency",
              `${data.personalMetrics.callEfficiency}%`,
              <Clock className="w-6 h-6 text-green-500" />,
              data.personalMetrics.callEfficiency,
              "Time management & speed"
            )}
            {renderMetricCard(
              "Customer Satisfaction",
              `${data.personalMetrics.customerSentiment}%`,
              <Heart className="w-6 h-6 text-red-500" />,
              data.personalMetrics.customerSentiment,
              "Positive customer interactions"
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderMetricCard(
              "Resolution Speed",
              `${data.personalMetrics.resolutionSpeed}%`,
              <Target className="w-6 h-6 text-purple-500" />,
              data.personalMetrics.resolutionSpeed,
              "Fast problem solving"
            )}
            {renderMetricCard(
              "Script Adherence",
              `${data.personalMetrics.scriptAdherence}%`,
              <FileText className="w-6 h-6 text-orange-500" />,
              data.personalMetrics.scriptAdherence,
              "Following procedures"
            )}
            {renderMetricCard(
              "Speech Clarity",
              `${data.personalMetrics.speechClarity}%`,
              <Mic className="w-6 h-6 text-teal-500" />,
              data.personalMetrics.speechClarity,
              "Clear communication"
            )}
          </div>

          {/* Strengths and Improvement Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Your Strengths
                </CardTitle>
                <CardDescription>
                  Areas where you're performing exceptionally well
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-1">
                      <h4 className="font-medium text-green-800">{strength.area}</h4>
                      <p className="text-sm text-green-600">{strength.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-700">{strength.score}%</span>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Improvement Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Growth Opportunities
                </CardTitle>
                <CardDescription>
                  Areas with the highest potential for improvement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.improvementAreas.map((area, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-800">{area.area}</h4>
                      <p className="text-sm text-blue-600">{area.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-700">{area.score}%</span>
                      <AlertCircle className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                Recent Achievements
              </CardTitle>
              <CardDescription>
                Congratulations on your recent improvements!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.achievements.map((achievement, index) => (
                  <div key={index} className={clsx(
                    "p-4 rounded-lg border text-center",
                    achievement.isNew ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200"
                  )}>
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h4 className="font-semibold mb-1">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.dateEarned}
                      {achievement.isNew && <Badge className="ml-2 bg-yellow-500">New!</Badge>}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Performance Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                This Week's Improvement
              </CardTitle>
              <CardDescription>
                You're on track for a {data.personalMetrics.improvement.lastWeek}% improvement this week!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-green-500">
                  +{data.personalMetrics.improvement.lastWeek}%
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">vs last week</p>
                  <p className="text-sm font-medium">Keep up the great work!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>
                Personalized suggestions based on your performance analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* IMPLEMENT LATER: AI-generated recommendations will be fetched from backend */}
                {data.recommendations.map((rec, index) => (
                  <Card key={rec.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-5 h-5 text-yellow-500" />
                          <h3 className="font-semibold">{rec.title}</h3>
                          <Badge className={`${getPriorityColor(rec.priority)} text-xs`}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-blue-600 font-medium">
                            Category: {rec.category}
                          </span>
                          <span className="text-green-600 font-medium">
                            Impact: {rec.estimatedImpact}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="ml-4">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="ml-7">
                      <h4 className="font-medium text-sm mb-2">Specific Actions:</h4>
                      <ul className="space-y-1">
                        {rec.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* IMPLEMENT LATER: Training recommendations based on improvement areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                Recommended Training
              </CardTitle>
              <CardDescription>
                Courses and resources to address your improvement areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-800">Script Adherence Mastery</h4>
                      <p className="text-sm text-blue-600">Focus on closing procedures and documentation</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-500 text-white">Recommended</Badge>
                      <p className="text-xs text-blue-600 mt-1">45 min</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-green-800">Efficient Call Management</h4>
                      <p className="text-sm text-green-600">Techniques to reduce call duration without sacrificing quality</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-500 text-white">High Impact</Badge>
                      <p className="text-xs text-green-600 mt-1">30 min</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Call Analysis Tab */}
      {activeTab === "call-analysis" && (
        <div className="space-y-6">
          {/* Call Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-500" />
                Call Selection
              </CardTitle>
              <CardDescription>
                Select a recent call to analyze in detail
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="space-y-4 mb-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by customer name, call type, or call ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={showFilters ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="default" className="ml-1 px-1 py-0 text-xs">
                        {[searchTerm !== "" ? 1 : 0, 
                          filters.type !== "All" ? 1 : 0,
                          filters.resolution !== "All" ? 1 : 0,
                          filters.sentiment !== "All" ? 1 : 0,
                          filters.dateRange !== "All" ? 1 : 0].reduce((a, b) => a + b, 0)}
                      </Badge>
                    )}
                  </Button>

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <X className="w-4 h-4" />
                      Clear All
                    </Button>
                  )}

                  <div className="text-sm text-muted-foreground">
                    {filteredCalls.length} of {data.recentCalls.length} calls
                  </div>
                </div>

                {/* Filter Options */}
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
                    {/* Call Type Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Call Type</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="outline" className="w-full justify-between">
                            {filters.type}
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          {["All", "Billing Issue", "Technical Support", "Product Inquiry", "Account Update", "Complaint"].map((type) => (
                            <DropdownMenuItem
                              key={type}
                              onClick={() => setFilters(prev => ({ ...prev, type: type as CallType }))}
                            >
                              {type}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Resolution Status Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Resolution Status</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="outline" className="w-full justify-between">
                            {filters.resolution}
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          {["All", "Resolved", "Escalated", "Pending"].map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => setFilters(prev => ({ ...prev, resolution: status as ResolutionStatus }))}
                            >
                              {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Sentiment Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Customer Sentiment</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="outline" className="w-full justify-between">
                            {filters.sentiment}
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          {["All", "Positive", "Neutral", "Negative"].map((sentiment) => (
                            <DropdownMenuItem
                              key={sentiment}
                              onClick={() => setFilters(prev => ({ ...prev, sentiment: sentiment as SentimentFilter }))}
                            >
                              {sentiment}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date Range</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="outline" className="w-full justify-between">
                            {filters.dateRange}
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          {["All", "Today", "Yesterday", "This Week", "Last Week"].map((range) => (
                            <DropdownMenuItem
                              key={range}
                              onClick={() => setFilters(prev => ({ ...prev, dateRange: range }))}
                            >
                              {range}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </div>

              {/* Call List */}
              <div className="space-y-3">
                {filteredCalls.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No calls found</p>
                    <p className="text-sm">Try adjusting your search terms or filters</p>
                  </div>
                ) : (
                  filteredCalls.map((call) => (
                    <div 
                      key={call.id}
                      className={clsx(
                        "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                        selectedCall === call.id 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => setSelectedCall(call.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select call with ${call.customerName} on ${call.date}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedCall(call.id);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{call.customerName}</h4>
                            <Badge variant="default" className="text-xs">
                              {call.type}
                            </Badge>
                            <span className={`px-2 py-1 rounded-full text-xs ${getSentimentColor(call.sentiment)}`}>
                              {getSentimentLabel(call.sentiment)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{call.date} at {call.time}</span>
                            <span>{call.duration} min</span>
                            <span>★ {call.satisfaction}</span>
                            <span className={call.resolution === "Resolved" ? "text-green-600" : "text-orange-600"}>
                              {call.resolution}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Analyze
                          </Button>
                          <Button size="sm" variant="outline">
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Listen
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Call Analysis */}
          {selectedCall && data.callAnalysis[selectedCall] && (
            <div className="space-y-6">
              {/* IMPLEMENT LATER: Call analysis data will be fetched from backend based on selected call */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    Call Analysis: {data.recentCalls.find(c => c.id === selectedCall)?.customerName}
                  </CardTitle>
                  <CardDescription>
                    Detailed performance analysis for this specific call
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Transcript Summary */}
                    <div>
                      <h4 className="font-medium mb-2">Call Summary</h4>
                      <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-lg">
                        {data.callAnalysis[selectedCall].transcriptSummary}
                      </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {data.callAnalysis[selectedCall].scriptAdherence.overall}%
                        </div>
                        <p className="text-sm text-blue-600 font-medium">Script Adherence</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {data.callAnalysis[selectedCall].sentimentAnalysis.final > 0 ? '+' : ''}{data.callAnalysis[selectedCall].sentimentAnalysis.final}
                        </div>
                        <p className="text-sm text-green-600 font-medium">Final Sentiment</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {data.callAnalysis[selectedCall].efficiencyMetrics.timeSpent}m
                        </div>
                        <p className="text-sm text-purple-600 font-medium">Call Duration</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {data.callAnalysis[selectedCall].speechMetrics.clarity}%
                        </div>
                        <p className="text-sm text-orange-600 font-medium">Speech Clarity</p>
                      </div>
                    </div>

                    {/* Script Adherence Breakdown */}
                    <div>
                      <h4 className="font-medium mb-3">Script Adherence Breakdown</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Greeting</span>
                            <span className="font-medium">{data.callAnalysis[selectedCall].scriptAdherence.greeting}%</span>
                          </div>
                          <Progress value={data.callAnalysis[selectedCall].scriptAdherence.greeting} />
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Problem Identification</span>
                            <span className="font-medium">{data.callAnalysis[selectedCall].scriptAdherence.problemIdentification}%</span>
                          </div>
                          <Progress value={data.callAnalysis[selectedCall].scriptAdherence.problemIdentification} />
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Solution Presentation</span>
                            <span className="font-medium">{data.callAnalysis[selectedCall].scriptAdherence.solutionPresentation}%</span>
                          </div>
                          <Progress value={data.callAnalysis[selectedCall].scriptAdherence.solutionPresentation} />
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Closing</span>
                            <span className="font-medium">{data.callAnalysis[selectedCall].scriptAdherence.closing}%</span>
                          </div>
                          <Progress value={data.callAnalysis[selectedCall].scriptAdherence.closing} />
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-2 text-red-600">Missed Elements</h5>
                          <ul className="space-y-1 text-sm">
                            {data.callAnalysis[selectedCall].scriptAdherence.missedElements.map((item: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Speech Analysis */}
                    <div>
                      <h4 className="font-medium mb-3">Speech Quality Analysis</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {data.callAnalysis[selectedCall].speechMetrics.clarity}%
                          </div>
                          <p className="text-sm text-muted-foreground">Clarity</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {data.callAnalysis[selectedCall].speechMetrics.consistency}%
                          </div>
                          <p className="text-sm text-muted-foreground">Consistency</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {data.callAnalysis[selectedCall].speechMetrics.speed} WPM
                          </div>
                          <p className="text-sm text-muted-foreground">Speed</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {data.callAnalysis[selectedCall].speechMetrics.volume}%
                          </div>
                          <p className="text-sm text-muted-foreground">Volume</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-teal-600">
                            {data.callAnalysis[selectedCall].speechMetrics.tone}%
                          </div>
                          <p className="text-sm text-muted-foreground">Tone</p>
                        </div>
                      </div>
                    </div>

                    {/* Specific Improvement Tips */}
                    <div>
                      <h4 className="font-medium mb-3">Call-Specific Improvement Tips</h4>
                      <div className="space-y-2">
                        {data.callAnalysis[selectedCall].specificSuggestions.map((tip: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                            <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Feedback */}
                    <div>
                      <h4 className="font-medium mb-3">Customer Feedback</h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <span className="font-medium">
                            {data.callAnalysis[selectedCall].customerSatisfaction.score}/5.0
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          "{data.callAnalysis[selectedCall].customerSatisfaction.feedback}"
                        </p>
                        <p className="text-sm text-blue-600">
                          <strong>Suggested improvement:</strong> {data.callAnalysis[selectedCall].customerSatisfaction.improvements}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === "progress" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                Progress Tracking
              </CardTitle>
              <CardDescription>
                Track your improvements over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.progressMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{metric.metric}</h4>
                      <p className="text-sm text-muted-foreground">
                        {metric.improvement} compared to last week
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {metric.currentValue}{metric.unit}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          vs {metric.previousValue}{metric.unit}
                        </div>
                      </div>
                      <div className={`p-2 rounded-full ${
                        metric.trend === "up" ? "bg-green-100" : "bg-red-100"
                      }`}>
                        {metric.trend === "up" ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* IMPLEMENT LATER: Visual progress charts and goal setting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Goal Setting & Tracking
              </CardTitle>
              <CardDescription>
                Set performance goals and track your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Weekly Goal: Improve Script Adherence</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Progress value={84} className="flex-1" />
                    <span className="text-sm font-medium text-blue-600">84% / 90%</span>
                  </div>
                  <p className="text-sm text-blue-600">6 points to go! You're making great progress.</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">Monthly Goal: Reduce Call Duration</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Progress value={75} className="flex-1" />
                    <span className="text-sm font-medium text-green-600">5.2m / 4.5m target</span>
                  </div>
                  <p className="text-sm text-green-600">0.7 minutes to go! Almost there!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievement Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                Achievement Progress
              </CardTitle>
              <CardDescription>
                Upcoming achievements you can unlock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <h4 className="font-medium">Perfect Week</h4>
                      <p className="text-sm text-muted-foreground">90%+ adherence for 7 days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">5/7 days</div>
                    <Progress value={71} className="w-16 h-2 mt-1" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">⚡</div>
                    <div>
                      <h4 className="font-medium">Speed Master</h4>
                      <p className="text-sm text-muted-foreground">Average call under 4 minutes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">5.2m current</div>
                    <Progress value={77} className="w-16 h-2 mt-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
