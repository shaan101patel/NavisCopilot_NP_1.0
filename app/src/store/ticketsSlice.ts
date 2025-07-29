import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ticketAPI, Ticket, CreateTicketRequest, UpdateTicketRequest, TicketListOptions } from '../services/tickets';

interface TicketsState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: string[];
    priority: string[];
    assigned_to: string[];
    search?: string;
    issue_category?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  availableAgents: Array<{ id: string; name: string; role: string }>;
}

const initialState: TicketsState = {
  tickets: [],
  selectedTicket: null,
  loading: false,
  error: null,
  filters: {
    status: [],
    priority: [],
    assigned_to: [],
  },
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  },
  availableAgents: [],
};

// Async thunks for API operations
export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (options: TicketListOptions = {}, { rejectWithValue }) => {
    try {
      const response = await ticketAPI.getTickets(options);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch tickets');
    }
  }
);

export const fetchTicketById = createAsyncThunk(
  'tickets/fetchTicketById',
  async (ticketId: string, { rejectWithValue }) => {
    try {
      const ticket = await ticketAPI.getTicket(ticketId);
      return ticket;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch ticket');
    }
  }
);

export const createTicket = createAsyncThunk(
  'tickets/createTicket',
  async (ticketData: CreateTicketRequest, { rejectWithValue }) => {
    try {
      const ticket = await ticketAPI.createTicket(ticketData);
      return ticket;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create ticket');
    }
  }
);

export const updateTicket = createAsyncThunk(
  'tickets/updateTicket',
  async ({ id, updates }: { id: string; updates: UpdateTicketRequest }, { rejectWithValue }) => {
    try {
      const ticket = await ticketAPI.updateTicket(id, updates);
      return ticket;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update ticket');
    }
  }
);

export const deleteTicket = createAsyncThunk(
  'tickets/deleteTicket',
  async (ticketId: string, { rejectWithValue }) => {
    try {
      await ticketAPI.deleteTicket(ticketId);
      return ticketId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete ticket');
    }
  }
);

export const fetchAvailableAgents = createAsyncThunk(
  'tickets/fetchAvailableAgents',
  async (_, { rejectWithValue }) => {
    try {
      const agents = await ticketAPI.getAvailableAgents();
      return agents;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch available agents');
    }
  }
);

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setSelectedTicket(state, action: PayloadAction<Ticket | null>) {
      state.selectedTicket = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    setFilters(state, action: PayloadAction<Partial<TicketsState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = {
        status: [],
        priority: [],
        assigned_to: [],
      };
    },
    setPagination(state, action: PayloadAction<Partial<TicketsState['pagination']>>) {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    // Local optimistic updates
    optimisticUpdateTicket(state, action: PayloadAction<{ id: string; updates: Partial<Ticket> }>) {
      const { id, updates } = action.payload;
      const ticketIndex = state.tickets.findIndex(ticket => ticket.id === id);
      if (ticketIndex !== -1) {
        state.tickets[ticketIndex] = { ...state.tickets[ticketIndex], ...updates };
        if (state.selectedTicket?.id === id) {
          state.selectedTicket = { ...state.selectedTicket, ...updates };
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch tickets
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.tickets;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch ticket by ID
    builder
      .addCase(fetchTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTicket = action.payload;
        // Also update the ticket in the list if it exists
        const ticketIndex = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
        if (ticketIndex !== -1) {
          state.tickets[ticketIndex] = action.payload;
        }
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create ticket
    builder
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update ticket
    builder
      .addCase(updateTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        state.loading = false;
        const ticketIndex = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
        if (ticketIndex !== -1) {
          state.tickets[ticketIndex] = action.payload;
        }
        if (state.selectedTicket?.id === action.payload.id) {
          state.selectedTicket = action.payload;
        }
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete ticket
    builder
      .addCase(deleteTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = state.tickets.filter(ticket => ticket.id !== action.payload);
        if (state.selectedTicket?.id === action.payload) {
          state.selectedTicket = null;
        }
        state.pagination.total -= 1;
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch available agents
    builder
      .addCase(fetchAvailableAgents.fulfilled, (state, action) => {
        state.availableAgents = action.payload;
      })
      .addCase(fetchAvailableAgents.rejected, (state, action) => {
        console.error('Failed to fetch available agents:', action.payload);
      });
  },
});

export const {
  setSelectedTicket,
  clearError,
  setFilters,
  clearFilters,
  setPagination,
  optimisticUpdateTicket,
} = ticketsSlice.actions;

export default ticketsSlice.reducer;

// Selectors
export const selectTickets = (state: { tickets: TicketsState }) => state.tickets.tickets;
export const selectSelectedTicket = (state: { tickets: TicketsState }) => state.tickets.selectedTicket;
export const selectTicketsLoading = (state: { tickets: TicketsState }) => state.tickets.loading;
export const selectTicketsError = (state: { tickets: TicketsState }) => state.tickets.error;
export const selectTicketFilters = (state: { tickets: TicketsState }) => state.tickets.filters;
export const selectTicketPagination = (state: { tickets: TicketsState }) => state.tickets.pagination;
export const selectAvailableAgents = (state: { tickets: TicketsState }) => state.tickets.availableAgents;
