import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// IMPLEMENT LATER: Replace this mock data with real data from the backend (Supabase).
// Expected data: Array of active tickets, each with ticket ID, customer name, status, and call info.
const mockTickets = [
  { id: "TCK-001", customer: "Jane Doe", status: "Active", callStatus: "In Progress" },
  { id: "TCK-002", customer: "John Smith", status: "Pending", callStatus: "Waiting" },
];

export default function Dashboard() {
  // IMPLEMENT LATER: Fetch tickets and call data for the current agent from Supabase.
  const [tickets] = useState(mockTickets);

  return (
    <div>
      <h1 className="text-3xl font-heading mb-6">Agent Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="p-6 flex flex-col gap-4">
            <div>
              <div className="text-lg font-semibold">{ticket.customer}</div>
              <div className="text-sm text-gray-500">Ticket ID: {ticket.id}</div>
              <div className="text-sm text-gray-500">Status: {ticket.status}</div>
              <div className="text-sm text-gray-500">Call: {ticket.callStatus}</div>
            </div>
            <div className="flex gap-2 mt-4">
              {/* IMPLEMENT LATER: Wire up these buttons to backend actions (join/leave call, open ticket) */}
              <Button variant="outline" className="bg-primary text-white hover:bg-blue-700">
                Join Call
              </Button>
              <Button variant="secondary">View Ticket</Button>
            </div>
          </Card>
        ))}
      </div>
      {/* IMPLEMENT LATER: Add section for live transcription and AI suggestions, pulling real-time data from backend */}
      <div className="mt-10">
        <h2 className="text-2xl font-heading mb-2">Live Transcription & AI Suggestions</h2>
        <Card className="p-6">
          {/* IMPLEMENT LATER: Show live transcription and AI RAG output for the current call.
              Data needed: Real-time transcript, AI-generated suggestions, and script guidance.
          */}
          <div className="text-gray-400 italic">Live transcription and AI suggestions will appear here.</div>
        </Card>
      </div>
    </div>
  );
}
