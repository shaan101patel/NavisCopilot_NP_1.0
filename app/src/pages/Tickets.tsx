import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// IMPLEMENT LATER: Replace with real ticket data from backend (Supabase).
// Expected data: Array of tickets (id, customer, subject, status, assigned agent, createdAt, updatedAt, related call info).
const mockTickets = [
  { id: "TCK-001", customer: "Jane Doe", subject: "Order Issue", status: "Open", assignedTo: "Agent A", createdAt: "2025-07-01" },
  { id: "TCK-002", customer: "John Smith", subject: "Account Help", status: "Pending", assignedTo: "Agent B", createdAt: "2025-07-01" },
];

export default function Tickets() {
  // IMPLEMENT LATER: Fetch ticket list from backend (Supabase).
  const [tickets] = useState(mockTickets);

  // IMPLEMENT LATER: Add state and logic for creating, assigning, and resolving tickets with backend integration.

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-heading">Tickets</h1>
        {/* IMPLEMENT LATER: Add ticket creation modal and logic */}
        <Button className="bg-primary text-white hover:bg-blue-700">
          + New Ticket
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="p-6 flex justify-between items-center">
            <div>
              <div className="text-lg font-semibold">{ticket.subject}</div>
              <div className="text-sm text-gray-500">Customer: {ticket.customer}</div>
              <div className="text-sm text-gray-500">Assigned to: {ticket.assignedTo}</div>
              <div className="text-sm text-gray-500">Status: {ticket.status}</div>
              <div className="text-sm text-gray-500">Created: {ticket.createdAt}</div>
            </div>
            <div className="flex gap-2">
              {/* IMPLEMENT LATER: Wire up these buttons to backend actions (assign, resolve, view details) */}
              <Button variant="outline">
                Assign
              </Button>
              <Button variant="secondary">
                Resolve
              </Button>
              <Button variant="outline">
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {/* IMPLEMENT LATER: Add ticket detail view/modal for editing, adding notes, and viewing call/AI data */}
    </div>
  );
}
