import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Save,
  Phone,
  MessageSquare,
  Eye,
  MoreHorizontal,
  Tag,
  Users
} from "lucide-react";

// IMPLEMENT LATER: Replace with real ticket data from backend (Supabase).
// Expected backend data structure:
// interface Ticket {
//   id: string;
//   customer: string;
//   customerEmail?: string;
//   subject: string;
//   description?: string;
//   status: 'open' | 'pending' | 'in-progress' | 'resolved' | 'closed';
//   priority: 'low' | 'medium' | 'high' | 'urgent';
//   assignedTo: string;
//   assignedToId?: string;
//   createdAt: string;
//   updatedAt: string;
//   dueDate?: string;
//   category?: string;
//   tags?: string[];
//   relatedCallId?: string;
//   customerSatisfaction?: number;
//   resolutionNotes?: string;
// }

const mockTickets = [
  { 
    id: "TCK-001", 
    customer: "Jane Doe", 
    customerEmail: "jane.doe@email.com",
    subject: "Order Processing Issue", 
    description: "Unable to complete order checkout due to payment error",
    status: "open", 
    priority: "high",
    assignedTo: "Agent A", 
    assignedToId: "agent-001",
    createdAt: "2025-07-08T10:30:00Z", 
    updatedAt: "2025-07-08T10:30:00Z",
    category: "Technical Support",
    tags: ["payment", "checkout"],
    relatedCallId: "call-123"
  },
  { 
    id: "TCK-002", 
    customer: "John Smith", 
    customerEmail: "john.smith@email.com",
    subject: "Account Access Help", 
    description: "Customer locked out of account after password reset",
    status: "pending", 
    priority: "medium",
    assignedTo: "Agent B", 
    assignedToId: "agent-002",
    createdAt: "2025-07-07T14:15:00Z", 
    updatedAt: "2025-07-08T09:20:00Z",
    dueDate: "2025-07-09T17:00:00Z",
    category: "Account Management",
    tags: ["password", "access"]
  },
  { 
    id: "TCK-003", 
    customer: "Alice Johnson", 
    customerEmail: "alice.j@email.com",
    subject: "Billing Discrepancy", 
    description: "Charges don't match the service plan subscribed to",
    status: "in-progress", 
    priority: "medium",
    assignedTo: "Agent C", 
    assignedToId: "agent-003",
    createdAt: "2025-07-06T16:45:00Z", 
    updatedAt: "2025-07-08T11:10:00Z",
    category: "Billing",
    tags: ["billing", "subscription"],
    customerSatisfaction: 4
  },
  { 
    id: "TCK-004", 
    customer: "Mike Wilson", 
    customerEmail: "mike.w@email.com",
    subject: "Feature Request - Dark Mode", 
    description: "Request to add dark mode theme to mobile app",
    status: "resolved", 
    priority: "low",
    assignedTo: "Agent A", 
    assignedToId: "agent-001",
    createdAt: "2025-07-05T11:20:00Z", 
    updatedAt: "2025-07-07T15:30:00Z",
    category: "Feature Request",
    tags: ["mobile", "ui"],
    customerSatisfaction: 5,
    resolutionNotes: "Feature added to development roadmap for Q3 2025"
  },
  { 
    id: "TCK-005", 
    customer: "Sarah Brown", 
    customerEmail: "sarah.brown@email.com",
    subject: "Service Outage Report", 
    description: "Experiencing connectivity issues since yesterday evening",
    status: "urgent", 
    priority: "urgent",
    assignedTo: "Agent D", 
    assignedToId: "agent-004",
    createdAt: "2025-07-08T08:00:00Z", 
    updatedAt: "2025-07-08T08:05:00Z",
    category: "Technical Support",
    tags: ["outage", "connectivity", "urgent"]
  }
];

const mockAgents = [
  { id: "agent-001", name: "Agent A" },
  { id: "agent-002", name: "Agent B" },
  { id: "agent-003", name: "Agent C" },
  { id: "agent-004", name: "Agent D" },
  { id: "unassigned", name: "Unassigned" }
];

const statusConfig = {
  open: { label: "Open", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", icon: AlertCircle },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: Clock },
  "in-progress": { label: "In Progress", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", icon: Clock },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400", icon: CheckCircle },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: AlertCircle }
};

const priorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
  high: { label: "High", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" }
};

type SortField = "createdAt" | "status" | "customer" | "priority" | "updatedAt";
type SortDirection = "asc" | "desc";

interface NewTicketForm {
  customer: string;
  customerEmail: string;
  subject: string;
  description: string;
  priority: string;
  assignedTo: string;
  category: string;
  tags: string;
}

interface EditTicketForm extends NewTicketForm {
  status: string;
  resolutionNotes?: string;
}

export default function Tickets() {
  // State management
  const [tickets, setTickets] = useState(mockTickets);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [newTicketForm, setNewTicketForm] = useState<NewTicketForm>({
    customer: "",
    customerEmail: "",
    subject: "",
    description: "",
    priority: "medium",
    assignedTo: "unassigned",
    category: "General",
    tags: ""
  });

  const [editTicketForm, setEditTicketForm] = useState<EditTicketForm>({
    customer: "",
    customerEmail: "",
    subject: "",
    description: "",
    status: "open",
    priority: "medium",
    assignedTo: "unassigned",
    category: "General",
    tags: "",
    resolutionNotes: ""
  });

  // IMPLEMENT LATER: Backend integration for ticket operations
  // Expected API endpoints:
  // - GET /api/tickets?search=&sort=&direction=&page=&limit= (fetch tickets with pagination/filtering)
  // - POST /api/tickets (create new ticket)
  // - PUT /api/tickets/:id (update existing ticket)
  // - DELETE /api/tickets/:id (delete ticket)
  // - GET /api/agents (fetch available agents for assignment)

  // Search and filtering logic
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = tickets;

    // IMPLEMENT LATER: For large datasets, search should be handled by backend
    // Send search query to: GET /api/tickets?search=${searchQuery}
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = tickets.filter(ticket => 
        ticket.id.toLowerCase().includes(query) ||
        ticket.customer.toLowerCase().includes(query) ||
        ticket.subject.toLowerCase().includes(query) ||
        ticket.description?.toLowerCase().includes(query) ||
        ticket.category?.toLowerCase().includes(query) ||
        ticket.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // IMPLEMENT LATER: Sorting should be handled by backend for large datasets
    // Send sort parameters to: GET /api/tickets?sort=${sortField}&direction=${sortDirection}
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle different data types
      if (sortField === "createdAt" || sortField === "updatedAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [tickets, searchQuery, sortField, sortDirection]);

  // Sorting handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // IMPLEMENT LATER: Backend integration for ticket creation
  // Expected payload: NewTicketForm data
  // API endpoint: POST /api/tickets
  // Response: Created ticket object with generated ID
  const handleCreateTicket = async () => {
    if (!newTicketForm.customer.trim() || !newTicketForm.subject.trim()) {
      alert("Please fill in required fields: Customer and Subject");
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      const newTicket = {
        id: `TCK-${String(tickets.length + 1).padStart(3, '0')}`,
        ...newTicketForm,
        customerEmail: newTicketForm.customerEmail || "",
        description: newTicketForm.description || "",
        status: "open" as const,
        assignedToId: newTicketForm.assignedTo,
        assignedTo: mockAgents.find(a => a.id === newTicketForm.assignedTo)?.name || "Unassigned",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: newTicketForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      // IMPLEMENT LATER: Replace with actual API call
      // const response = await fetch('/api/tickets', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newTicketForm)
      // });
      // const newTicket = await response.json();

      setTickets(prev => [newTicket, ...prev]);
      setNewTicketForm({
        customer: "",
        customerEmail: "",
        subject: "",
        description: "",
        priority: "medium",
        assignedTo: "unassigned",
        category: "General",
        tags: ""
      });
      setShowNewTicketModal(false);
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // IMPLEMENT LATER: Backend integration for ticket updates
  // Expected payload: EditTicketForm data with ticket ID
  // API endpoint: PUT /api/tickets/:id
  // Response: Updated ticket object
  const handleEditTicket = async () => {
    if (!selectedTicket || !editTicketForm.customer.trim() || !editTicketForm.subject.trim()) {
      alert("Please fill in required fields: Customer and Subject");
      return;
    }

    setIsLoading(true);

    try {
      const updatedTicket = {
        ...selectedTicket,
        ...editTicketForm,
        assignedToId: editTicketForm.assignedTo,
        assignedTo: mockAgents.find(a => a.id === editTicketForm.assignedTo)?.name || "Unassigned",
        updatedAt: new Date().toISOString(),
        tags: editTicketForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      // IMPLEMENT LATER: Replace with actual API call
      // const response = await fetch(`/api/tickets/${selectedTicket.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editTicketForm)
      // });
      // const updatedTicket = await response.json();

      setTickets(prev => prev.map(ticket => 
        ticket.id === selectedTicket.id ? updatedTicket : ticket
      ));
      setShowEditModal(false);
      setSelectedTicket(null);
    } catch (error) {
      console.error('Failed to update ticket:', error);
      alert('Failed to update ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // IMPLEMENT LATER: Backend integration for ticket deletion
  // Expected payload: Ticket ID
  // API endpoint: DELETE /api/tickets/:id
  // Response: Success confirmation
  const handleDeleteTicket = async (ticketId: string) => {
    setIsLoading(true);

    try {
      // IMPLEMENT LATER: Replace with actual API call
      // await fetch(`/api/tickets/${ticketId}`, {
      //   method: 'DELETE'
      // });

      setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      alert('Failed to delete ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Modal and form handlers
  const openEditModal = (ticket: any) => {
    setSelectedTicket(ticket);
    setEditTicketForm({
      customer: ticket.customer,
      customerEmail: ticket.customerEmail || "",
      subject: ticket.subject,
      description: ticket.description || "",
      status: ticket.status,
      priority: ticket.priority,
      assignedTo: ticket.assignedToId || "unassigned",
      category: ticket.category || "General",
      tags: (ticket.tags || []).join(', '),
      resolutionNotes: ticket.resolutionNotes || ""
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    const IconComponent = config.icon;
    return (
      <Badge variant="default" className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return null;
    
    return (
      <Badge variant="default" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">
            Manage customer support tickets and track resolution progress
          </p>
        </div>
        <Button 
          onClick={() => setShowNewTicketModal(true)}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tickets by ID, customer, subject, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Sort by {sortField}
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleSort("createdAt")}>
                    Date Created {sortField === "createdAt" && (sortDirection === "desc" ? "↓" : "↑")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("updatedAt")}>
                    Last Updated {sortField === "updatedAt" && (sortDirection === "desc" ? "↓" : "↑")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("status")}>
                    Status {sortField === "status" && (sortDirection === "desc" ? "↓" : "↑")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("customer")}>
                    Customer {sortField === "customer" && (sortDirection === "desc" ? "↓" : "↑")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("priority")}>
                    Priority {sortField === "priority" && (sortDirection === "desc" ? "↓" : "↑")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Results summary */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredAndSortedTickets.length} of {tickets.length} tickets
            {searchQuery && (
              <span className="ml-2">
                • Filtered by "{searchQuery}"
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSearchQuery("")}
                  className="ml-2 h-auto p-1"
                >
                  <X className="w-3 h-3" />
                </Button>
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-muted-foreground mt-2">Loading tickets...</p>
            </CardContent>
          </Card>
        )}
        
        {!isLoading && filteredAndSortedTickets.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 
                  `No tickets match your search for "${searchQuery}"` : 
                  "No tickets available. Create your first ticket to get started."
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowNewTicketModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Ticket
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {!isLoading && filteredAndSortedTickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Main ticket info */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-medium text-muted-foreground">
                      {ticket.id}
                    </span>
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                    {ticket.relatedCallId && (
                      <Badge variant="info" className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Call Linked
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold line-clamp-1">
                      {ticket.subject}
                    </h3>
                    {ticket.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                        {ticket.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {ticket.customer}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {ticket.assignedTo}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(ticket.createdAt)}
                    </div>
                    {ticket.category && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {ticket.category}
                      </div>
                    )}
                  </div>
                  
                  {ticket.tags && ticket.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {ticket.tags.map((tag, index) => (
                        <Badge key={index} variant="default" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(ticket)}
                    className="flex items-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(ticket.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {ticket.relatedCallId && (
                        <DropdownMenuItem>
                          <Phone className="w-4 h-4 mr-2" />
                          View Call
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Note
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Create New Ticket</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowNewTicketModal(false)}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={newTicketForm.customer}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, customer: e.target.value }))}
                      placeholder="Enter customer name"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Customer Email
                    </label>
                    <Input
                      type="email"
                      value={newTicketForm.customerEmail}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                      placeholder="customer@email.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newTicketForm.subject}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of the issue"
                    disabled={isLoading}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTicketForm.description}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the issue..."
                    rows={4}
                    disabled={isLoading}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical"
                  />
                </div>

                {/* Priority and Assignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={newTicketForm.priority}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                      disabled={isLoading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Assign To</label>
                    <select
                      value={newTicketForm.assignedTo}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                      disabled={isLoading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {mockAgents.map(agent => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category and Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={newTicketForm.category}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, category: e.target.value }))}
                      disabled={isLoading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="General">General</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing">Billing</option>
                      <option value="Account Management">Account Management</option>
                      <option value="Feature Request">Feature Request</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <Input
                      value={newTicketForm.tags}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="billing, urgent, escalation (comma-separated)"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="border-t border-border p-6">
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewTicketModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTicket}
                  disabled={isLoading || !newTicketForm.customer.trim() || !newTicketForm.subject.trim()}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Create Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {showEditModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Edit Ticket</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ticket ID: {selectedTicket.id}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowEditModal(false)}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={editTicketForm.customer}
                      onChange={(e) => setEditTicketForm(prev => ({ ...prev, customer: e.target.value }))}
                      placeholder="Enter customer name"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Customer Email
                    </label>
                    <Input
                      type="email"
                      value={editTicketForm.customerEmail}
                      onChange={(e) => setEditTicketForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                      placeholder="customer@email.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={editTicketForm.subject}
                    onChange={(e) => setEditTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of the issue"
                    disabled={isLoading}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={editTicketForm.description}
                    onChange={(e) => setEditTicketForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the issue..."
                    rows={4}
                    disabled={isLoading}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical"
                  />
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={editTicketForm.status}
                      onChange={(e) => setEditTicketForm(prev => ({ ...prev, status: e.target.value }))}
                      disabled={isLoading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={editTicketForm.priority}
                      onChange={(e) => setEditTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                      disabled={isLoading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Assignment and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Assign To</label>
                    <select
                      value={editTicketForm.assignedTo}
                      onChange={(e) => setEditTicketForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                      disabled={isLoading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {mockAgents.map(agent => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={editTicketForm.category}
                      onChange={(e) => setEditTicketForm(prev => ({ ...prev, category: e.target.value }))}
                      disabled={isLoading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="General">General</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing">Billing</option>
                      <option value="Account Management">Account Management</option>
                      <option value="Feature Request">Feature Request</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <Input
                    value={editTicketForm.tags}
                    onChange={(e) => setEditTicketForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="billing, urgent, escalation (comma-separated)"
                    disabled={isLoading}
                  />
                </div>

                {/* Resolution Notes (if resolved/closed) */}
                {(editTicketForm.status === 'resolved' || editTicketForm.status === 'closed') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Resolution Notes
                    </label>
                    <textarea
                      value={editTicketForm.resolutionNotes || ""}
                      onChange={(e) => setEditTicketForm(prev => ({ ...prev, resolutionNotes: e.target.value }))}
                      placeholder="Describe how the issue was resolved..."
                      rows={3}
                      disabled={isLoading}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical"
                    />
                  </div>
                )}
              </div>
            </CardContent>

            <div className="border-t border-border p-6">
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleEditTicket}
                  disabled={isLoading || !editTicketForm.customer.trim() || !editTicketForm.subject.trim()}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Delete Ticket</h2>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <p className="text-sm">
                Are you sure you want to delete ticket <strong>{showDeleteConfirm}</strong>? 
                This will permanently remove the ticket and all associated data.
              </p>
            </CardContent>

            <div className="border-t border-border p-6">
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleDeleteTicket(showDeleteConfirm)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 hover:border-red-300 flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
