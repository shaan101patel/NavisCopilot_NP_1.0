import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ChevronLeft, ChevronRight, Eye, EyeOff, Check, X, AlertCircle, Shield, KeyRound } from "lucide-react";
import { ticketAPI, type Ticket } from "@/services/tickets";
import { useApiKey } from "@/contexts/ApiKeyContext";
import { apiKeyAPI } from "@/services/supabase";
import { cn } from "@/lib/utils";

// IMPLEMENT LATER: Replace this mock data with real data from the backend (Supabase).
// Expected data structure:
// - tickets: Array<{
//     id: string,
//     customer: string,
//     status: 'active' | 'pending' | 'resolved' | 'closed',
//     callStatus: 'in_progress' | 'waiting' | 'completed' | 'scheduled',
//     priority: 'low' | 'medium' | 'high' | 'urgent',
//     createdAt: Date,
//     updatedAt: Date,
//     assignedAgentId: string,
//     category: string,
//     description: string,
//     customerPhone?: string,
//     customerEmail?: string
//   }>
// - Real-time updates via WebSocket for ticket status changes
// - Filtering by agent assignment and ticket status
const mockTickets = [
  { id: "TCK-001", customer: "Jane Doe", status: "Active", callStatus: "In Progress", priority: "high", createdAt: new Date(), category: "Technical Support" },
  { id: "TCK-002", customer: "John Smith", status: "Pending", callStatus: "Waiting", priority: "medium", createdAt: new Date(), category: "Billing" },
  { id: "TCK-003", customer: "Sarah Johnson", status: "Active", callStatus: "Completed", priority: "low", createdAt: new Date(), category: "General Inquiry" },
  { id: "TCK-004", customer: "Mike Chen", status: "Pending", callStatus: "Scheduled", priority: "urgent", createdAt: new Date(), category: "Technical Support" },
  { id: "TCK-005", customer: "Emily Rodriguez", status: "Active", callStatus: "In Progress", priority: "medium", createdAt: new Date(), category: "Account Management" },
];

// Notifications section removed from dashboard

// IMPLEMENT LATER: Replace with real inbound number data from backend
// Expected data structure:
// - availableNumbers: Array<{
//     id: string,
//     phoneNumber: string,
//     type: 'local' | 'toll_free' | 'international',
//     location: string,
//     status: 'available' | 'assigned' | 'pending',
//     assignedAgentId?: string,
//     createdAt: Date
//   }>
// - currentInboundNumber: {
//     agentId: string,
//     inboundNumber: string,
//     numberId: string,
//     assignedAt: Date,
//     status: 'active' | 'inactive'
//   }
// Backend API endpoints needed:
// - GET /api/agents/{agentId}/inbound-numbers - Fetch available numbers for agent
// - PUT /api/agents/{agentId}/inbound-number - Update selected inbound number
// - POST /api/phone-numbers/request - Request new phone number (if feature enabled)
const mockAvailableNumbers = [
  { id: "num-1", phoneNumber: "+1 (555) 123-4567", type: "local", location: "New York, NY", status: "available" },
  { id: "num-2", phoneNumber: "+1 (800) 555-0123", type: "toll_free", location: "Toll-Free", status: "available" },
  { id: "num-3", phoneNumber: "+1 (555) 987-6543", type: "local", location: "Los Angeles, CA", status: "assigned" },
];

const mockCurrentInboundNumber = {
  agentId: "agent-123",
  inboundNumber: "+1 (555) 123-4567",
  numberId: "num-1",
  assignedAt: new Date(Date.now() - 86400000), // 1 day ago
  status: "active"
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { apiKeyMasked, save: saveApiKey, remove: removeApiKey, refresh: refreshApiKey } = useApiKey();
  // IMPLEMENT LATER: Fetch tickets and call data for the current agent from Supabase.
  // const [tickets] = useState(mockTickets);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState<boolean>(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);

  // API Key configuration state
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // masked value comes from ApiKeyContext (authorized calls only)

  const hasStoredApiKey = Boolean(apiKeyMasked && apiKeyMasked.trim().length > 0);

  const handleStartCall = () => {
    console.log('Starting new call...');
    navigate('/live-call');
  };

  // Notifications navigation removed with section

  useEffect(() => {
    let isMounted = true;
    // Ensure API key status is fetched when dashboard loads
    refreshApiKey().catch(() => {});
    (async () => {
      try {
        setTicketsLoading(true);
        setTicketsError(null);
        const { tickets: recent } = await ticketAPI.getTickets({ limit: 9, sort: 'created_at', direction: 'desc' });
        if (isMounted) {
          setTickets(recent);
          setCurrentTicketIndex(0);
        }
      } catch (e: any) {
        if (isMounted) setTicketsError(e?.message || 'Failed to load recent tickets');
      } finally {
        if (isMounted) setTicketsLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // (Old inbound number handlers removed; replaced by API Key Configuration UI above.)

  // Carousel navigation
  const nextTicket = () => {
    setCurrentTicketIndex((prev) => tickets.length ? (prev + 1) % tickets.length : 0);
  };

  const prevTicket = () => {
    setCurrentTicketIndex((prev) => tickets.length ? (prev - 1 + tickets.length) % tickets.length : 0);
  };

  // Get tickets for carousel display (show 3 at a time)
  const getVisibleTickets = () => {
    const visibleTickets: Ticket[] = [];
    const count = Math.min(3, tickets.length);
    for (let i = 0; i < count; i++) {
      const index = (currentTicketIndex + i) % (tickets.length || 1);
      if (tickets[index]) visibleTickets.push(tickets[index]);
    }
    return visibleTickets;
  };

  const handleViewTicket = (ticketId: string) => {
    navigate(`/tickets?id=${encodeURIComponent(ticketId)}`);
  };


  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-heading mb-6 text-foreground">Agent Dashboard</h1>
      
      {/* Call Button */}
      <div className="mb-8">
        <Button 
          onClick={handleStartCall}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-lg flex items-center gap-2"
        >
          <Phone size={20} />
          Start Call
        </Button>
      </div>

      {/* API Key Configuration Section */}
      <div className="mb-8">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Section Header */}
            <div>
              <h2 className="text-2xl font-heading text-foreground mb-2 flex items-center gap-2"><KeyRound size={20}/> API Key Configuration</h2>
              <p className="text-muted-foreground">
                Store your transcription API key securely. It’s encrypted at rest and only visible to you.
              </p>
            </div>

            {/* Current Key Status */}
            <div
              className={cn(
                "p-4 rounded-lg border flex items-center justify-between transition-colors",
                hasStoredApiKey
                  ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
                  : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
              )}
            >
              <div>
                <h3 className="font-medium text-foreground mb-1">Current API Key</h3>
                <p className="font-mono text-primary text-sm" aria-live="polite">{apiKeyMasked || '— Not configured —'}</p>
                <p className="text-xs text-muted-foreground mt-1">Stored encrypted. Only a masked preview is shown.</p>
              </div>
              <Shield size={18} className="text-muted-foreground" aria-hidden="true"/>
            </div>

            {/* Update Key */}
            <div className="space-y-3">
              <label htmlFor="api-key" className="block text-sm font-medium text-foreground">Enter API Key</label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="gsk_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  aria-describedby="api-key-help"
                />
                <Button variant="outline" onClick={() => setShowApiKey(v => !v)} aria-label={showApiKey ? 'Hide API key' : 'Show API key'}>
                  {showApiKey ? <EyeOff size={16}/> : <Eye size={16}/>} 
                </Button>
              </div>
              <p id="api-key-help" className="text-xs text-muted-foreground">The key will be validated before saving and stored encrypted.</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Button
                onClick={async () => {
                  try {
                    setStatusMessage(null); setValidating(true);
                    const data = await apiKeyAPI.validate(apiKey);
                    if (!data.valid) { setStatusMessage({ type: 'error', text: data.error || 'API key is invalid' }); }
                    else { setStatusMessage({ type: 'success', text: 'API key looks valid' }); }
                  } catch (e: any) {
                    setStatusMessage({ type: 'error', text: e.message || 'Validation failed' });
                  } finally { setValidating(false); }
                }}
                variant="outline"
                disabled={!apiKey}
              >
                {validating ? 'Validating…' : 'Validate'}
              </Button>

              <Button
                onClick={async () => {
                  try {
                    setSaving(true); setStatusMessage(null);
                    await saveApiKey(apiKey);
                    await refreshApiKey();
                    setStatusMessage({ type: 'success', text: 'API key saved' });
                    setApiKey('');
                  } catch (e: any) {
                    setStatusMessage({ type: 'error', text: e.message || 'Failed to save API key' });
                  } finally { setSaving(false); }
                }}
                disabled={!apiKey}
                className="flex items-center gap-2"
              >
                <Check size={16}/> {saving ? 'Saving…' : 'Save API Key'}
              </Button>

              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    setDeleting(true); setStatusMessage(null);
                    await removeApiKey();
                    await refreshApiKey();
                    setStatusMessage({ type: 'success', text: 'API key removed' });
                  } catch (e: any) {
                    setStatusMessage({ type: 'error', text: e.message || 'Failed to delete API key' });
                  } finally { setDeleting(false); }
                }}
              >
                {deleting ? 'Removing…' : 'Delete API Key'}
              </Button>
            </div>

            {statusMessage && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                statusMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {statusMessage.type === 'success' ? <Check size={16}/> : <AlertCircle size={16}/>} 
                <span className="text-sm font-medium">{statusMessage.text}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Tickets Carousel */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-heading text-foreground">Recent Tickets</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevTicket}
              disabled={tickets.length <= 3}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextTicket}
              disabled={tickets.length <= 3}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {ticketsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse h-40 bg-muted/40" />
            ))}
          </div>
        ) : ticketsError ? (
          <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 flex items-center gap-2">
            <AlertCircle size={16} />
            <span className="text-sm">{ticketsError}</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-6 rounded-lg border border-border bg-muted/30 text-muted-foreground">
            No recent tickets. Create one from the Tickets page.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getVisibleTickets().map((ticket) => (
              <Card key={ticket.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-card-foreground truncate">{ticket.title}</div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ticket.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {ticket.priority}
                  </div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>ID: {ticket.ticket_number || ticket.id}</div>
                  <div>Status: {ticket.status}</div>
                  <div>Customer: {ticket.customer_name || '—'}</div>
                  <div>Category: {ticket.issue_category || 'General'}</div>
                  <div>Call: {ticket.call_id ? 'Linked' : '—'}</div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewTicket(ticket.id)}
                  >
                    View Ticket
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Notifications Section intentionally removed */}
    </div>
  );
}
