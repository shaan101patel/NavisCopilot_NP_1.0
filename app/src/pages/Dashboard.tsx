import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ChevronLeft, ChevronRight, Bell, MessageSquare, Users } from "lucide-react";

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

// IMPLEMENT LATER: Replace with real notifications/messages data from backend
// Expected data structure:
// - notifications: Array<{
//     id: string,
//     type: 'message' | 'system' | 'ticket_update' | 'call_alert',
//     title: string,
//     content: string,
//     senderId?: string,
//     senderName?: string,
//     recipientId: string,
//     isRead: boolean,
//     createdAt: Date,
//     priority: 'low' | 'medium' | 'high',
//     actionRequired?: boolean,
//     relatedTicketId?: string,
//     relatedCallId?: string
//   }>
// - Real-time notifications via WebSocket
// - Push notifications for urgent messages
const mockNotifications = [
  { id: "not-1", type: "message", title: "New message from Manager", content: "Please review the latest customer feedback report", senderName: "Sarah Wilson", isRead: false, createdAt: new Date(Date.now() - 1800000), priority: "medium" },
  { id: "not-2", type: "ticket_update", title: "Ticket TCK-001 updated", content: "Customer provided additional information", isRead: false, createdAt: new Date(Date.now() - 3600000), priority: "high" },
  { id: "not-3", type: "call_alert", title: "Incoming call transferred", content: "Call from John Smith has been transferred to you", isRead: true, createdAt: new Date(Date.now() - 7200000), priority: "urgent" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  // IMPLEMENT LATER: Fetch tickets and call data for the current agent from Supabase.
  const [tickets] = useState(mockTickets);
  const [notifications] = useState(mockNotifications);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);

  // IMPLEMENT LATER: Connect to backend call initiation system
  const handleStartCall = () => {
    // IMPLEMENT LATER: Initiate new call
    // Expected API call:
    // - Endpoint: POST /api/calls/initiate
    // - Payload: { agentId: string, callType: 'outbound' | 'inbound', priority?: string }
    // - Response: { callId: string, status: 'initializing' | 'ready', sessionInfo: CallSession }
    // - Redirect to Live Call page with call context
    console.log('Starting new call...');
    navigate('/live-call');
  };

  const handleGoToMessages = () => {
    navigate('/messages');
  };

  // Carousel navigation
  const nextTicket = () => {
    setCurrentTicketIndex((prev) => (prev + 1) % tickets.length);
  };

  const prevTicket = () => {
    setCurrentTicketIndex((prev) => (prev - 1 + tickets.length) % tickets.length);
  };

  // Get tickets for carousel display (show 3 at a time)
  const getVisibleTickets = () => {
    const visibleTickets = [];
    for (let i = 0; i < Math.min(3, tickets.length); i++) {
      const index = (currentTicketIndex + i) % tickets.length;
      visibleTickets.push(tickets[index]);
    }
    return visibleTickets;
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getVisibleTickets().map((ticket) => (
            <Card key={ticket.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-card-foreground">{ticket.customer}</div>
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
                <div>ID: {ticket.id}</div>
                <div>Status: {ticket.status}</div>
                <div>Call: {ticket.callStatus}</div>
                <div>Category: {ticket.category}</div>
              </div>
              <div className="flex gap-2 mt-2">
                {/* IMPLEMENT LATER: Wire up these buttons to backend actions (join/leave call, open ticket) */}
                <Button variant="outline" size="sm" className="flex-1">
                  Join Call
                </Button>
                <Button variant="secondary" size="sm" className="flex-1">
                  View Ticket
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Notifications Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-heading text-foreground">Notifications</h2>
          <Button
            variant="outline"
            onClick={handleGoToMessages}
            className="flex items-center gap-2"
          >
            <Bell size={16} />
            Go to Messages
          </Button>
        </div>
        
        <Card className="p-6">
          <div className="space-y-4">
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className={`p-2 rounded-full ${
                  notification.type === 'message' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  notification.type === 'ticket_update' ? 'bg-green-100 dark:bg-green-900/20' :
                  'bg-red-100 dark:bg-red-900/20'
                }`}>
                  {notification.type === 'message' ? <MessageSquare size={16} className="text-blue-600 dark:text-blue-400" /> :
                   notification.type === 'ticket_update' ? <Users size={16} className="text-green-600 dark:text-green-400" /> :
                   <Bell size={16} className="text-red-600 dark:text-red-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-card-foreground">{notification.title}</div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{notification.content}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {notification.senderName && `From: ${notification.senderName} • `}
                    {notification.createdAt.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {notifications.length > 3 && (
              <div className="text-center pt-2">
                <Button variant="ghost" onClick={handleGoToMessages}>
                  View {notifications.length - 3} more notifications
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
