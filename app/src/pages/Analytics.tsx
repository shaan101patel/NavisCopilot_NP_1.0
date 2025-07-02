import { Card } from "@/components/ui/card";

// IMPLEMENT LATER: Replace with real analytics data from backend (Supabase).
// Expected data: 
// - Aggregate call metrics (total calls, avg. call time, resolution rate)
// - Sentiment analysis scores (per call, per agent, overall)
// - Script adherence rates
// - Customer satisfaction scores
// - Time-series data for trends

const mockAnalytics = {
  totalCalls: 124,
  avgCallTime: "4m 32s",
  resolutionRate: "87%",
  sentimentScore: 4.2, // out of 5
  scriptAdherence: "92%",
  customerSatisfaction: "4.5/5",
  callTrends: [
    { date: "2025-06-26", calls: 18 },
    { date: "2025-06-27", calls: 22 },
    { date: "2025-06-28", calls: 19 },
    { date: "2025-06-29", calls: 28 },
    { date: "2025-06-30", calls: 17 },
  ],
};

export default function Analytics() {
  // IMPLEMENT LATER: Fetch analytics and performance data from backend (Supabase).
  const data = mockAnalytics;

  return (
    <div>
      <h1 className="text-3xl font-heading mb-6">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="text-sm text-gray-500">Total Calls</div>
          <div className="text-2xl font-bold">{data.totalCalls}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-500">Avg. Call Time</div>
          <div className="text-2xl font-bold">{data.avgCallTime}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-500">Resolution Rate</div>
          <div className="text-2xl font-bold">{data.resolutionRate}</div>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="text-sm text-gray-500">Sentiment Score</div>
          <div className="text-2xl font-bold">{data.sentimentScore}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-500">Script Adherence</div>
          <div className="text-2xl font-bold">{data.scriptAdherence}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-500">Customer Satisfaction</div>
          <div className="text-2xl font-bold">{data.customerSatisfaction}</div>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {/* IMPLEMENT LATER: Replace with a real time-series chart component */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Call Volume Trends (Last 5 Days)</h2>
          <div className="space-y-2">
            {data.callTrends.map((trend, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded">
                <span>{trend.date}</span>
                <span className="font-semibold">{trend.calls} calls</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {/* IMPLEMENT LATER: Add more advanced analytics, filtering, and export options as needed */}
    </div>
  );
}
