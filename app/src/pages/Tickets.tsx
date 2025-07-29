import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TicketDetailsView } from "@/components/tickets";
import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { 
  fetchTickets,
  fetchAvailableAgents,
  createTicket,
  updateTicket,
  deleteTicket,
  setFilters,
  clearFilters,
  setPagination,
  setSelectedTicket,
  clearError,
  selectTickets,
  selectTicketsLoading,
  selectTicketsError,
  selectTicketFilters,
  selectTicketPagination,
  selectAvailableAgents,
  selectSelectedTicket
} from "@/store/ticketsSlice";
import { Ticket, CreateTicketRequest, UpdateTicketRequest } from "@/services/tickets";
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
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

type SortField = "created_at" | "updated_at" | "title" | "status" | "priority" | "assigned_to";
type SortDirection = "asc" | "desc";

interface NewTicketForm {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  issue_category: string;
  tags: string;
}

interface EditTicketForm {
  title: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "closed" | "escalated";
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  issue_category: string;
  tags: string;
  agent_notes: string;
  resolution_summary: string;
}

const statusColors = {
  "open": "bg-blue-100 text-blue-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  "resolved": "bg-green-100 text-green-800",
  "closed": "bg-gray-100 text-gray-800",
  "escalated": "bg-red-100 text-red-800"
};

const priorityColors = {
  "low": "bg-gray-100 text-gray-800",
  "medium": "bg-blue-100 text-blue-800",
  "high": "bg-orange-100 text-orange-800",
  "urgent": "bg-red-100 text-red-800"
};

const statusIcons = {
  "open": AlertCircle,
  "in-progress": Clock,
  "resolved": CheckCircle,
  "closed": CheckCircle,
  "escalated": AlertCircle
};

export default function Tickets() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const tickets = useSelector(selectTickets);
  const loading = useSelector(selectTicketsLoading);
  const error = useSelector(selectTicketsError);
  const filters = useSelector(selectTicketFilters);
  const pagination = useSelector(selectTicketPagination);
  const availableAgents = useSelector(selectAvailableAgents);
  const selectedTicket = useSelector(selectSelectedTicket);

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [selectedTicketForDetails, setSelectedTicketForDetails] = useState<Ticket | null>(null);

  // Form states
  const [newTicketForm, setNewTicketForm] = useState<NewTicketForm>({
    title: "",
    description: "",
    priority: "medium",
    assigned_to: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    issue_category: "General",
    tags: ""
  });

  const [editTicketForm, setEditTicketForm] = useState<EditTicketForm>({
    title: "",
    description: "",
    status: "open",
    priority: "medium",
    assigned_to: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    issue_category: "General",
    tags: "",
    agent_notes: "",
    resolution_summary: ""
  });

  // Load tickets and agents on component mount
  useEffect(() => {
    loadTickets();
    dispatch(fetchAvailableAgents());
  }, []);

  // Reload tickets when filters, pagination, or sorting changes
  useEffect(() => {
    loadTickets();
  }, [filters, pagination.page, pagination.limit, sortField, sortDirection, searchQuery]);

  const loadTickets = () => {
    dispatch(fetchTickets({
      page: pagination.page,
      limit: pagination.limit,
      sort: sortField,
      direction: sortDirection,
      filters: {
        ...filters,
        search: searchQuery.trim() || undefined
      }
    }));
  };

  // Filtering and sorting logic
  const filteredAndSortedTickets = useMemo(() => {
    // Since we're using server-side filtering and sorting,
    // we just return the tickets as-is from the API
    return tickets;
  }, [tickets]);

  // Sorting handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Create ticket handler
  const handleCreateTicket = async () => {
    if (!newTicketForm.title.trim() || !newTicketForm.description.trim()) {
      alert("Please fill in required fields: Title and Description");
      return;
    }

    try {
      const ticketData: CreateTicketRequest = {
        title: newTicketForm.title,
        description: newTicketForm.description,
        priority: newTicketForm.priority,
        assigned_to: newTicketForm.assigned_to || undefined,
        customer_name: newTicketForm.customer_name || undefined,
        customer_email: newTicketForm.customer_email || undefined,
        customer_phone: newTicketForm.customer_phone || undefined,
        issue_category: newTicketForm.issue_category || undefined,
        tags: newTicketForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      await dispatch(createTicket(ticketData)).unwrap();
      
      // Reset form and close modal
      setNewTicketForm({
        title: "",
        description: "",
        priority: "medium",
        assigned_to: "",
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        issue_category: "General",
        tags: ""
      });
      setShowNewTicketModal(false);
    } catch (error: any) {
      console.error('Failed to create ticket:', error);
      alert(`Failed to create ticket: ${error.message || 'Unknown error'}`);
    }
  };

  // Update ticket handler
  const handleUpdateTicket = async () => {
    if (!selectedTicket || !editTicketForm.title.trim() || !editTicketForm.description.trim()) {
      alert("Please fill in required fields: Title and Description");
      return;
    }

    try {
      const updates: UpdateTicketRequest = {
        title: editTicketForm.title,
        description: editTicketForm.description,
        status: editTicketForm.status,
        priority: editTicketForm.priority,
        assigned_to: editTicketForm.assigned_to || undefined,
        customer_name: editTicketForm.customer_name || undefined,
        customer_email: editTicketForm.customer_email || undefined,
        customer_phone: editTicketForm.customer_phone || undefined,
        issue_category: editTicketForm.issue_category || undefined,
        agent_notes: editTicketForm.agent_notes || undefined,
        resolution_summary: editTicketForm.resolution_summary || undefined,
        tags: editTicketForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      await dispatch(updateTicket({ id: selectedTicket.id, updates })).unwrap();
      setShowEditModal(false);
    } catch (error: any) {
      console.error('Failed to update ticket:', error);
      alert(`Failed to update ticket: ${error.message || 'Unknown error'}`);
    }
  };

  // Delete ticket handler
  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      return;
    }

    try {
      await dispatch(deleteTicket(ticketId)).unwrap();
      setShowDeleteConfirm(null);
    } catch (error: any) {
      console.error('Failed to delete ticket:', error);
      alert(`Failed to delete ticket: ${error.message || 'Unknown error'}`);
    }
  };

  // Edit ticket modal setup
  const openEditModal = (ticket: Ticket) => {
    dispatch(setSelectedTicket(ticket));
    setEditTicketForm({
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      assigned_to: ticket.assigned_to || "",
      customer_name: ticket.customer_name || "",
      customer_email: ticket.customer_email || "",
      customer_phone: ticket.customer_phone || "",
      issue_category: ticket.issue_category || "General",
      tags: (ticket.tags || []).join(", "),
      agent_notes: ticket.agent_notes || "",
      resolution_summary: ticket.resolution_summary || ""
    });
    setShowEditModal(true);
  };

  // Ticket details modal setup
  const openTicketDetails = (ticket: Ticket) => {
    setSelectedTicketForDetails(ticket);
    setShowTicketDetails(true);
  };

  // Filter handlers
  const handleFilterChange = (filterType: keyof typeof filters, value: string[]) => {
    dispatch(setFilters({ [filterType]: value }));
    dispatch(setPagination({ page: 1 })); // Reset to first page when filtering
  };

  // Search handler with debouncing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    dispatch(setPagination({ page: 1 })); // Reset to first page when searching
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    dispatch(setPagination({ page: newPage }));
  };

  const handlePageSizeChange = (newLimit: number) => {
    dispatch(setPagination({ page: 1, limit: newLimit }));
  };

  // Clear error handler
  const handleClearError = () => {
    dispatch(clearError());
  };

  // Render agent name
  const getAgentName = (agentId?: string) => {
    if (!agentId) return "Unassigned";
    const agent = availableAgents.find(a => a.id === agentId);
    return agent ? agent.name : "Unknown Agent";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tickets</h1>
          <p className="text-gray-600">Manage customer support tickets</p>
        </div>
        <Button 
          onClick={() => setShowNewTicketModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearError}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tickets by title, description, customer name, or ticket number..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {(filters.status.length > 0 || filters.priority.length > 0 || filters.assigned_to.length > 0) && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {filters.status.length + filters.priority.length + filters.assigned_to.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="p-2">
                <div className="mb-2">
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1 space-y-1">
                    {['open', 'in-progress', 'resolved', 'closed', 'escalated'].map(status => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleFilterChange('status', [...filters.status, status]);
                            } else {
                              handleFilterChange('status', filters.status.filter(s => s !== status));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="capitalize text-sm">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-2">
                  <label className="text-sm font-medium">Priority</label>
                  <div className="mt-1 space-y-1">
                    {['low', 'medium', 'high', 'urgent'].map(priority => (
                      <label key={priority} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.priority.includes(priority)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleFilterChange('priority', [...filters.priority, priority]);
                            } else {
                              handleFilterChange('priority', filters.priority.filter(p => p !== priority));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="capitalize text-sm">{priority}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => dispatch(clearFilters())}
                  className="w-full mt-2"
                >
                  Clear Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">All Tickets</h2>
            <div className="text-sm text-gray-500">
              Showing {tickets.length} of {pagination.total} tickets
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading tickets...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filters.status.length > 0 || filters.priority.length > 0 
                  ? "No tickets match your current filters. Try adjusting your search criteria."
                  : "Get started by creating your first ticket."
                }
              </p>
              {!(searchQuery || filters.status.length > 0 || filters.priority.length > 0) && (
                <Button onClick={() => setShowNewTicketModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Ticket
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">
                        <button
                          onClick={() => handleSort("title")}
                          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                          Ticket
                          <ArrowUpDown className="w-4 h-4 ml-1" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">
                        <button
                          onClick={() => handleSort("status")}
                          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                          Status
                          <ArrowUpDown className="w-4 h-4 ml-1" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">
                        <button
                          onClick={() => handleSort("priority")}
                          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                          Priority
                          <ArrowUpDown className="w-4 h-4 ml-1" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">
                        <button
                          onClick={() => handleSort("assigned_to")}
                          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                          Assigned To
                          <ArrowUpDown className="w-4 h-4 ml-1" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">
                        <button
                          onClick={() => handleSort("created_at")}
                          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                          Created
                          <ArrowUpDown className="w-4 h-4 ml-1" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedTickets.map((ticket) => {
                      const StatusIcon = statusIcons[ticket.status];
                      return (
                        <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                                   onClick={() => openTicketDetails(ticket)}>
                                {ticket.title}
                              </div>
                              <div className="text-sm text-gray-500">#{ticket.ticket_number}</div>
                              {ticket.tags && ticket.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {ticket.tags.slice(0, 2).map((tag, index) => (
                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                      <Tag className="w-3 h-3 mr-1" />
                                      {tag}
                                    </span>
                                  ))}
                                  {ticket.tags.length > 2 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                      +{ticket.tags.length - 2} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${statusColors[ticket.status]} flex items-center w-fit`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {ticket.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={priorityColors[ticket.priority]}>
                              {ticket.priority}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {getAgentName(ticket.assigned_to)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="text-sm text-gray-900">{ticket.customer_name || 'N/A'}</div>
                              {ticket.customer_email && (
                                <div className="text-sm text-gray-500">{ticket.customer_email}</div>
                              )}
                              {ticket.call_id && (
                                <div className="flex items-center text-xs text-blue-600 mt-1">
                                  <Phone className="w-3 h-3 mr-1" />
                                  From Call
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => openTicketDetails(ticket)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditModal(ticket)}>
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setShowDeleteConfirm(ticket.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Show</span>
                    <select 
                      value={pagination.limit}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-700">per page</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
                  disabled={loading}
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
                      value={newTicketForm.customer_name}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, customer_name: e.target.value }))}
                      placeholder="Enter customer name"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Customer Email
                    </label>
                    <Input
                      type="email"
                      value={newTicketForm.customer_email}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, customer_email: e.target.value }))}
                      placeholder="customer@email.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newTicketForm.title}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the issue"
                    disabled={loading}
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
                    disabled={loading}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical"
                  />
                </div>

                {/* Priority and Assignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={newTicketForm.priority}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, priority: e.target.value as "low" | "medium" | "high" | "urgent" }))}
                      disabled={loading}
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
                      value={newTicketForm.assigned_to}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                      disabled={loading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {availableAgents.map(agent => (
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
                      value={newTicketForm.issue_category}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, issue_category: e.target.value }))}
                      disabled={loading}
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
                      disabled={loading}
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
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTicket}
                  disabled={loading || !newTicketForm.title.trim() || !newTicketForm.description.trim()}
                  className="flex items-center gap-2"
                >
                  {loading ? (
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
                  disabled={loading}
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
                      value={editTicketForm.customer_name}
                      onChange={(e) => setEditTicketForm(prev => ({ ...prev, customer_name: e.target.value }))}
                      placeholder="Enter customer name"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Customer Email
                    </label>
                    <Input
                      type="email"
                      value={editTicketForm.customer_email}
                      onChange={(e) => setEditTicketForm(prev => ({ ...prev, customer_email: e.target.value }))}
                      placeholder="customer@email.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={editTicketForm.title}
                    onChange={(e) => setEditTicketForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the issue"
                    disabled={loading}
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
                    disabled={loading}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical"
                  />
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={editTicketForm.status}
                      onChange={(e) => setEditTicketForm(prev => ({ ...prev, status: e.target.value as "open" | "in-progress" | "resolved" | "closed" | "escalated" }))}
                      disabled={loading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                      <option value="escalated">Escalated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={editTicketForm.priority}
                      onChange={(e) => setEditTicketForm(prev => ({ ...prev, priority: e.target.value as "low" | "medium" | "high" | "urgent" }))}
                      disabled={loading}
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
                      value={editTicketForm.assigned_to}
                      onChange={(e) => setEditTicketForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                      disabled={loading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {availableAgents.map(agent => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={editTicketForm.issue_category}
                      onChange={(e) => setEditTicketForm(prev => ({ ...prev, issue_category: e.target.value }))}
                      disabled={loading}
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
                    disabled={loading}
                  />
                </div>

                {/* Resolution Notes (if resolved/closed) */}
                {(editTicketForm.status === 'resolved' || editTicketForm.status === 'closed') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Resolution Notes
                    </label>
                    <textarea
                      value={editTicketForm.agent_notes || ""}
                      onChange={(e) => setEditTicketForm(prev => ({ ...prev, agent_notes: e.target.value }))}
                      placeholder="Describe how the issue was resolved..."
                      rows={3}
                      disabled={loading}
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
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateTicket}
                  disabled={loading || !editTicketForm.title.trim() || !editTicketForm.description.trim()}
                  className="flex items-center gap-2"
                >
                  {loading ? (
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
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleDeleteTicket(showDeleteConfirm)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 hover:border-red-300 flex items-center gap-2"
                >
                  {loading ? (
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

      {/* Ticket Details Modal */}
      {showTicketDetails && selectedTicketForDetails && (
        <TicketDetailsView
          ticket={selectedTicketForDetails}
          isOpen={showTicketDetails}
          onClose={() => {
            setShowTicketDetails(false);
            setSelectedTicketForDetails(null);
          }}
        />
      )}
    </div>
  );
}
