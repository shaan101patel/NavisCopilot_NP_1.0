import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// IMPLEMENT LATER: Replace with real user and analytics data from backend (Supabase).
// Expected data: Array of users (id, name, role, status), aggregate analytics, workflow configs.
const mockUsers = [
  { id: "USR-001", name: "Alice Johnson", role: "Agent", status: "Active" },
  { id: "USR-002", name: "Bob Lee", role: "Admin", status: "Active" },
  { id: "USR-003", name: "Charlie Kim", role: "Agent", status: "Inactive" },
];

export default function Admin() {
  // IMPLEMENT LATER: Fetch user list, analytics, and workflow configs from backend (Supabase).
  const [users] = useState(mockUsers);

  // IMPLEMENT LATER: Add state and logic for creating, editing, and deactivating users with backend integration.

  return (
    <div>
      <h1 className="text-3xl font-heading mb-6">Admin Panel</h1>
      <div className="mb-6">
        {/* IMPLEMENT LATER: Add user creation modal and logic */}
        <Button variant="default" disabled>
          + New User
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {users.map((user) => (
          <Card key={user.id} className="p-6 flex flex-col gap-4">
            <div>
              <div className="text-lg font-semibold">{user.name}</div>
              <div className="text-sm text-gray-500">Role: {user.role}</div>
              <div className="text-sm text-gray-500">Status: {user.status}</div>
            </div>
            <div className="flex gap-2 mt-4">
              {/* IMPLEMENT LATER: Wire up these buttons to backend actions (edit, deactivate, view details) */}
              <Button variant="outline" disabled>
                Edit
              </Button>
              <Button variant="destructive" disabled>
                Deactivate
              </Button>
              <Button variant="ghost" disabled>
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {/* IMPLEMENT LATER: Add sections for aggregate analytics and workflow configuration */}
      <div className="mb-8">
        <Card className="p-6">
          <div className="text-lg font-semibold mb-4">Aggregate Analytics</div>
          {/* IMPLEMENT LATER: Display aggregate analytics for users, tickets, and calls */}
          <div className="text-gray-400 italic">Aggregate analytics will appear here.</div>
        </Card>
      </div>
      <div>
        <Card className="p-6">
          <div className="text-lg font-semibold mb-4">Workflow Configuration</div>
          {/* IMPLEMENT LATER: UI for configuring workflows, permissions, and feature toggles */}
          <div className="text-gray-400 italic">Workflow configuration options will appear here.</div>
        </Card>
      </div>
    </div>
  );
}
