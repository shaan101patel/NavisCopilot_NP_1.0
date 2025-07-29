import { supabase } from './supabase';

// Types matching the Supabase tickets table schema
export interface Ticket {
  id: string;
  ticket_number?: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  created_by: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  call_id?: string;
  created_from_call?: boolean;
  agent_notes?: string;
  issue_category?: string;
  resolution_summary?: string;
  tags?: string[];
  ai_insights?: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  call_id?: string;
  created_from_call?: boolean;
  agent_notes?: string;
  issue_category?: string;
  tags?: string[];
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: 'open' | 'in-progress' | 'resolved' | 'closed' | 'escalated';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  agent_notes?: string;
  issue_category?: string;
  resolution_summary?: string;
  tags?: string[];
  ai_insights?: string[];
}

export interface TicketFilters {
  status?: string[];
  priority?: string[];
  assigned_to?: string[];
  search?: string;
  created_from_call?: boolean;
  issue_category?: string;
}

export interface TicketListOptions {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  filters?: TicketFilters;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ticketAPI = {
  /**
   * GET /api/tickets - List tickets with pagination/filtering
   */
  async getTickets(options: TicketListOptions = {}): Promise<TicketListResponse> {
    console.log('🎫 Getting tickets with options:', options);
    
    try {
      const {
        page = 1,
        limit = 50,
        sort = 'created_at',
        direction = 'desc',
        filters = {}
      } = options;

      // Start building the query
      let query = supabase
        .from('tickets')
        .select(`
          *,
          assigned_agent:profiles!tickets_assigned_to_fkey(full_name),
          created_by_agent:profiles!tickets_created_by_fkey(full_name)
        `, { count: 'exact' });

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority);
      }

      if (filters.assigned_to && filters.assigned_to.length > 0) {
        query = query.in('assigned_to', filters.assigned_to);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%`);
      }

      if (filters.created_from_call !== undefined) {
        query = query.eq('created_from_call', filters.created_from_call);
      }

      if (filters.issue_category) {
        query = query.eq('issue_category', filters.issue_category);
      }

      // Apply sorting
      query = query.order(sort, { ascending: direction === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error getting tickets:', error);
        throw new Error(error.message || 'Failed to get tickets');
      }

      const totalPages = Math.ceil((count || 0) / limit);

      // Transform the data to match our interface
      const tickets: Ticket[] = (data || []).map(ticket => ({
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        assigned_to: ticket.assigned_to,
        created_by: ticket.created_by,
        customer_name: ticket.customer_name,
        customer_email: ticket.customer_email,
        customer_phone: ticket.customer_phone,
        call_id: ticket.call_id,
        created_from_call: ticket.created_from_call,
        agent_notes: ticket.agent_notes,
        issue_category: ticket.issue_category,
        resolution_summary: ticket.resolution_summary,
        tags: ticket.tags || [],
        ai_insights: ticket.ai_insights || [],
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        resolved_at: ticket.resolved_at
      }));

      console.log('✅ Tickets retrieved successfully:', {
        count: tickets.length,
        total: count,
        page,
        totalPages
      });

      return {
        tickets,
        total: count || 0,
        page,
        limit,
        totalPages
      };
    } catch (error: any) {
      console.error('❌ Failed to get tickets:', error);
      throw error;
    }
  },

  /**
   * POST /api/tickets - Create new ticket
   */
  async createTicket(ticketData: CreateTicketRequest): Promise<Ticket> {
    console.log('🎫 Creating new ticket:', ticketData);
    
    try {
      // Get current user from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Generate a ticket number if not provided
      const ticketNumber = `TCK-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const insertData = {
        ticket_number: ticketNumber,
        title: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority || 'medium',
        assigned_to: ticketData.assigned_to || null,
        created_by: user.id,
        customer_name: ticketData.customer_name || null,
        customer_email: ticketData.customer_email || null,
        customer_phone: ticketData.customer_phone || null,
        call_id: ticketData.call_id || null,
        created_from_call: ticketData.created_from_call || false,
        agent_notes: ticketData.agent_notes || null,
        issue_category: ticketData.issue_category || null,
        tags: ticketData.tags || [],
        status: 'open'
      };

      const { data, error } = await supabase
        .from('tickets')
        .insert([insertData])
        .select(`
          *,
          assigned_agent:profiles!tickets_assigned_to_fkey(full_name),
          created_by_agent:profiles!tickets_created_by_fkey(full_name)
        `)
        .single();

      if (error) {
        console.error('❌ Error creating ticket:', error);
        throw new Error(error.message || 'Failed to create ticket');
      }

      console.log('✅ Ticket created successfully:', data.id);

      return {
        id: data.id,
        ticket_number: data.ticket_number,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assigned_to: data.assigned_to,
        created_by: data.created_by,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        call_id: data.call_id,
        created_from_call: data.created_from_call,
        agent_notes: data.agent_notes,
        issue_category: data.issue_category,
        resolution_summary: data.resolution_summary,
        tags: data.tags || [],
        ai_insights: data.ai_insights || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        resolved_at: data.resolved_at
      };
    } catch (error: any) {
      console.error('❌ Failed to create ticket:', error);
      throw error;
    }
  },

  /**
   * GET /api/tickets/{id} - Get ticket details
   */
  async getTicket(ticketId: string): Promise<Ticket> {
    console.log('🎫 Getting ticket details:', ticketId);
    
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          assigned_agent:profiles!tickets_assigned_to_fkey(full_name),
          created_by_agent:profiles!tickets_created_by_fkey(full_name)
        `)
        .eq('id', ticketId)
        .single();

      if (error) {
        console.error('❌ Error getting ticket:', error);
        if (error.code === 'PGRST116') {
          throw new Error('Ticket not found');
        }
        throw new Error(error.message || 'Failed to get ticket');
      }

      console.log('✅ Ticket retrieved successfully:', data.id);

      return {
        id: data.id,
        ticket_number: data.ticket_number,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assigned_to: data.assigned_to,
        created_by: data.created_by,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        call_id: data.call_id,
        created_from_call: data.created_from_call,
        agent_notes: data.agent_notes,
        issue_category: data.issue_category,
        resolution_summary: data.resolution_summary,
        tags: data.tags || [],
        ai_insights: data.ai_insights || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        resolved_at: data.resolved_at
      };
    } catch (error: any) {
      console.error('❌ Failed to get ticket:', error);
      throw error;
    }
  },

  /**
   * PUT /api/tickets/{id} - Update existing ticket
   */
  async updateTicket(ticketId: string, updates: UpdateTicketRequest): Promise<Ticket> {
    console.log('🎫 Updating ticket:', ticketId, updates);
    
    try {
      // Prepare the update data
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Set resolved_at if status is being changed to resolved
      if (updates.status === 'resolved' && updates.status !== undefined) {
        updateData.resolved_at = new Date().toISOString();
      }

      // Clear resolved_at if status is being changed from resolved to something else
      if (updates.status && updates.status !== 'resolved') {
        updateData.resolved_at = null;
      }

      const { data, error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId)
        .select(`
          *,
          assigned_agent:profiles!tickets_assigned_to_fkey(full_name),
          created_by_agent:profiles!tickets_created_by_fkey(full_name)
        `)
        .single();

      if (error) {
        console.error('❌ Error updating ticket:', error);
        if (error.code === 'PGRST116') {
          throw new Error('Ticket not found');
        }
        throw new Error(error.message || 'Failed to update ticket');
      }

      console.log('✅ Ticket updated successfully:', data.id);

      return {
        id: data.id,
        ticket_number: data.ticket_number,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assigned_to: data.assigned_to,
        created_by: data.created_by,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        call_id: data.call_id,
        created_from_call: data.created_from_call,
        agent_notes: data.agent_notes,
        issue_category: data.issue_category,
        resolution_summary: data.resolution_summary,
        tags: data.tags || [],
        ai_insights: data.ai_insights || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        resolved_at: data.resolved_at
      };
    } catch (error: any) {
      console.error('❌ Failed to update ticket:', error);
      throw error;
    }
  },

  /**
   * DELETE /api/tickets/{id} - Delete ticket
   */
  async deleteTicket(ticketId: string): Promise<{ success: boolean }> {
    console.log('🎫 Deleting ticket:', ticketId);
    
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      if (error) {
        console.error('❌ Error deleting ticket:', error);
        if (error.code === 'PGRST116') {
          throw new Error('Ticket not found');
        }
        throw new Error(error.message || 'Failed to delete ticket');
      }

      console.log('✅ Ticket deleted successfully:', ticketId);

      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to delete ticket:', error);
      throw error;
    }
  },

  /**
   * Helper function to get available agents for assignment
   */
  async getAvailableAgents(): Promise<Array<{ id: string; name: string; role: string }>> {
    console.log('👥 Getting available agents');
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', ['agent', 'manager', 'admin'])
        .order('full_name');

      if (error) {
        console.error('❌ Error getting agents:', error);
        throw new Error(error.message || 'Failed to get available agents');
      }

      return (data || []).map(agent => ({
        id: agent.id,
        name: agent.full_name || 'Unknown Agent',
        role: agent.role
      }));
    } catch (error: any) {
      console.error('❌ Failed to get available agents:', error);
      throw error;
    }
  },

  /**
   * Helper function to get ticket statistics
   */
  async getTicketStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    byPriority: Record<string, number>;
  }> {
    console.log('📊 Getting ticket statistics');
    
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('status, priority');

      if (error) {
        console.error('❌ Error getting ticket stats:', error);
        throw new Error(error.message || 'Failed to get ticket statistics');
      }

      const tickets = data || [];
      const total = tickets.length;
      const open = tickets.filter(t => t.status === 'open').length;
      const inProgress = tickets.filter(t => t.status === 'in-progress').length;
      const resolved = tickets.filter(t => t.status === 'resolved').length;

      const byPriority = tickets.reduce((acc, ticket) => {
        acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('✅ Ticket stats retrieved:', { total, open, inProgress, resolved });

      return {
        total,
        open,
        inProgress,
        resolved,
        byPriority
      };
    } catch (error: any) {
      console.error('❌ Failed to get ticket stats:', error);
      throw error;
    }
  }
};

export default ticketAPI; 