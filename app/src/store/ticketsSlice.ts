import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  callId?: string;
  tags: string[];
  aiInsights?: string[];
}

interface TicketsState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: string[];
    priority: string[];
    assignedTo: string[];
  };
}

const initialState: TicketsState = {
  tickets: [],
  selectedTicket: null,
  loading: false,
  error: null,
  filters: {
    status: [],
    priority: [],
    assignedTo: [],
  },
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setTickets(state, action: PayloadAction<Ticket[]>) {
      state.tickets = action.payload;
      state.loading = false;
      state.error = null;
    },
    addTicket(state, action: PayloadAction<Ticket>) {
      state.tickets.unshift(action.payload);
    },
    updateTicket(state, action: PayloadAction<{ id: string; updates: Partial<Ticket> }>) {
      const { id, updates } = action.payload;
      const ticketIndex = state.tickets.findIndex(ticket => ticket.id === id);
      if (ticketIndex !== -1) {
        state.tickets[ticketIndex] = { ...state.tickets[ticketIndex], ...updates };
        if (state.selectedTicket?.id === id) {
          state.selectedTicket = { ...state.selectedTicket, ...updates };
        }
      }
    },
    deleteTicket(state, action: PayloadAction<string>) {
      state.tickets = state.tickets.filter(ticket => ticket.id !== action.payload);
      if (state.selectedTicket?.id === action.payload) {
        state.selectedTicket = null;
      }
    },
    setSelectedTicket(state, action: PayloadAction<Ticket | null>) {
      state.selectedTicket = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
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
        assignedTo: [],
      };
    },
  },
});

export const {
  setTickets,
  addTicket,
  updateTicket,
  deleteTicket,
  setSelectedTicket,
  setLoading,
  setError,
  clearError,
  setFilters,
  clearFilters,
} = ticketsSlice.actions;

export default ticketsSlice.reducer;
