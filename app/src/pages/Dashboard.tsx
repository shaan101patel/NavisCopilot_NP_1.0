import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ChevronLeft, ChevronRight, Bell, MessageSquare, Users, ChevronDown, Check, X, AlertCircle } from "lucide-react";

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
  // IMPLEMENT LATER: Fetch tickets and call data for the current agent from Supabase.
  const [tickets] = useState(mockTickets);
  const [notifications] = useState(mockNotifications);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);

  // Inbound call number configuration state
  const [availableNumbers] = useState(mockAvailableNumbers);
  const [currentInboundNumber, setCurrentInboundNumber] = useState(mockCurrentInboundNumber);
  const [selectedNumberId, setSelectedNumberId] = useState(mockCurrentInboundNumber.numberId);
  const [showNumberDropdown, setShowNumberDropdown] = useState(false);
  const [customPhoneNumber, setCustomPhoneNumber] = useState("");
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

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

  // Inbound number configuration functions
  // IMPLEMENT LATER: Connect to backend for inbound number management
  const handleSaveInboundNumber = async () => {
    try {
      // IMPLEMENT LATER: Save selected inbound number to backend
      // Expected API call:
      // - Endpoint: PUT /api/agents/{agentId}/inbound-number
      // - Payload: { 
      //     numberId: string, 
      //     phoneNumber: string,
      //     customNumber?: string 
      //   }
      // - Response: { 
      //     success: boolean, 
      //     inboundNumber: string,
      //     assignedAt: Date,
      //     message: string 
      //   }
      // - Validation: Phone number format, availability check
      // - Update agent routing configuration
      // - Send confirmation email/SMS to agent

      const phoneNumber = isEditingCustom 
        ? customPhoneNumber 
        : availableNumbers.find(num => num.id === selectedNumberId)?.phoneNumber || "";

      // Validate phone number format
      if (!isValidPhoneNumber(phoneNumber)) {
        setSaveMessage({ type: 'error', text: 'Please enter a valid phone number format.' });
        return;
      }

      console.log('Saving inbound number:', phoneNumber);
      
      // Mock save operation
      setCurrentInboundNumber({
        agentId: "agent-123",
        inboundNumber: phoneNumber,
        numberId: isEditingCustom ? "custom" : selectedNumberId,
        assignedAt: new Date(),
        status: "active"
      });

      setSaveMessage({ type: 'success', text: 'Inbound call number updated successfully!' });
      setShowNumberDropdown(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);

    } catch (error) {
      console.error('Error saving inbound number:', error);
      setSaveMessage({ type: 'error', text: 'Failed to update inbound number. Please try again.' });
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const handleRequestNewNumber = async () => {
    // IMPLEMENT LATER: Request new phone number from backend
    // Expected API call:
    // - Endpoint: POST /api/phone-numbers/request
    // - Payload: { 
    //     agentId: string,
    //     numberType: 'local' | 'toll_free' | 'international',
    //     preferredLocation?: string,
    //     requestReason?: string
    //   }
    // - Response: { 
    //     requestId: string,
    //     status: 'pending' | 'approved' | 'processing',
    //     estimatedTime: string,
    //     message: string
    //   }
    // - Admin approval workflow for number requests
    // - Integration with phone number provider APIs
    // - Cost calculation and billing integration
    
    setIsRequesting(true);
    
    try {
      console.log('Requesting new phone number...');
      
      // Mock request process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSaveMessage({ 
        type: 'success', 
        text: 'New number request submitted! You will be notified when approved.' 
      });
      
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (error) {
      console.error('Error requesting new number:', error);
      setSaveMessage({ 
        type: 'error', 
        text: 'Failed to submit number request. Please try again.' 
      });
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsRequesting(false);
    }
  };

  // Phone number validation helper
  const isValidPhoneNumber = (phoneNumber: string): boolean => {
    // Basic phone number validation (US and international formats)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
    return phoneRegex.test(cleanNumber) && cleanNumber.length >= 10;
  };

  const handleNumberSelection = (numberId: string) => {
    setSelectedNumberId(numberId);
    setIsEditingCustom(false);
    setCustomPhoneNumber("");
    setShowNumberDropdown(false);
  };

  const handleCustomNumberEdit = () => {
    setIsEditingCustom(true);
    setSelectedNumberId("");
    setShowNumberDropdown(false);
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

      {/* Configure Inbound Call Number Section */}
      <div className="mb-8">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Section Header */}
            <div>
              <h2 className="text-2xl font-heading text-foreground mb-2">Configure Inbound Call Number</h2>
              <p className="text-muted-foreground">
                Set up the phone number where customers can reach you directly through Navis. 
                This number will be used for all inbound calls routed to your agent application.
              </p>
            </div>

            {/* Current Number Display */}
            {currentInboundNumber && (
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Current Inbound Number</h3>
                    <p className="text-lg font-mono text-primary">{currentInboundNumber.inboundNumber}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Configured on {currentInboundNumber.assignedAt.toLocaleDateString()} at {currentInboundNumber.assignedAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    currentInboundNumber.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {currentInboundNumber.status}
                  </div>
                </div>
              </div>
            )}

            {/* Phone Number Selection */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Select or Enter Phone Number</h3>
              
              {/* Available Numbers Dropdown */}
              <div className="space-y-3">
                <label htmlFor="number-selection" className="block text-sm font-medium text-foreground">
                  Choose from Available Numbers
                </label>
                <div className="relative">
                  <button
                    id="number-selection"
                    onClick={() => setShowNumberDropdown(!showNumberDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-input rounded-md bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-expanded={showNumberDropdown}
                    aria-haspopup="listbox"
                    disabled={isEditingCustom}
                  >
                    <span>
                      {selectedNumberId && !isEditingCustom
                        ? availableNumbers.find(num => num.id === selectedNumberId)?.phoneNumber
                        : 'Select a phone number...'
                      }
                    </span>
                    <ChevronDown size={16} className={`transition-transform ${showNumberDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showNumberDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                      {availableNumbers.filter(num => num.status === 'available').map((number) => (
                        <button
                          key={number.id}
                          onClick={() => handleNumberSelection(number.id)}
                          className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent focus:text-accent-foreground"
                          role="option"
                          aria-selected={selectedNumberId === number.id}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-mono">{number.phoneNumber}</div>
                              <div className="text-xs text-muted-foreground">
                                {number.type} • {number.location}
                              </div>
                            </div>
                            {selectedNumberId === number.id && (
                              <Check size={16} className="text-primary" />
                            )}
                          </div>
                        </button>
                      ))}
                      
                      {availableNumbers.filter(num => num.status === 'available').length === 0 && (
                        <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                          No available numbers found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Number Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="custom-number" className="block text-sm font-medium text-foreground">
                    Or Enter Custom Number
                  </label>
                  {!isEditingCustom && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCustomNumberEdit}
                      className="text-xs"
                    >
                      Enter Custom
                    </Button>
                  )}
                </div>
                
                {isEditingCustom && (
                  <div className="flex gap-2">
                    <Input
                      id="custom-number"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={customPhoneNumber}
                      onChange={(e) => setCustomPhoneNumber(e.target.value)}
                      className="flex-1"
                      aria-describedby="custom-number-help"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditingCustom(false);
                        setCustomPhoneNumber("");
                      }}
                      className="px-2"
                      title="Cancel custom number entry"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}
                
                {isEditingCustom && (
                  <p id="custom-number-help" className="text-xs text-muted-foreground">
                    Enter a valid phone number including country code (e.g., +1 for US numbers)
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Button
                onClick={handleSaveInboundNumber}
                disabled={!selectedNumberId && !customPhoneNumber.trim()}
                className="flex items-center gap-2"
              >
                <Check size={16} />
                Save Configuration
              </Button>
              
              <Button
                variant="outline"
                onClick={handleRequestNewNumber}
                disabled={isRequesting}
                className="flex items-center gap-2"
              >
                {isRequesting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Phone size={16} />
                )}
                {isRequesting ? 'Requesting...' : 'Request New Number'}
              </Button>
            </div>

            {/* Status Messages */}
            {saveMessage && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                saveMessage.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                  : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
              }`}>
                {saveMessage.type === 'success' ? (
                  <Check size={16} className="text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                )}
                <span className="text-sm font-medium">{saveMessage.text}</span>
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
