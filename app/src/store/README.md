# Redux Store Documentation

This directory contains the Redux Toolkit-based state management system for the Navis MVP frontend application.

## Structure Overview

```
src/store/
├── store.ts           # Main store configuration
├── hooks.ts           # Typed Redux hooks
├── userSlice.ts       # User authentication and session state
├── ticketsSlice.ts    # Ticket management state
├── callsSlice.ts      # Live calls and transcription state
├── analyticsSlice.ts  # Analytics and dashboard metrics
└── README.md          # This documentation
```

## State Slices

### 1. User Slice (`userSlice.ts`)
Manages user authentication, session data, and agent information.

**State:**
- `isAuthenticated`: Boolean indicating if user is logged in
- `user`: User object with id, name, email, role, and optional avatar
- `loading`: Loading state for auth operations
- `error`: Error messages for auth failures

**Actions:**
- `setUser(user)`: Set authenticated user data
- `logout()`: Clear user session
- `setLoading(boolean)`: Set loading state
- `setError(string)`: Set error message
- `clearError()`: Clear current error

### 2. Tickets Slice (`ticketsSlice.ts`)
Manages ticket creation, updates, filtering, and selection.

**State:**
- `tickets`: Array of all tickets
- `selectedTicket`: Currently selected ticket
- `loading`: Loading state for ticket operations
- `error`: Error messages
- `filters`: Current filter settings (status, priority, assignedTo)

**Actions:**
- `setTickets(tickets[])`: Set all tickets
- `addTicket(ticket)`: Add new ticket
- `updateTicket({id, updates})`: Update existing ticket
- `deleteTicket(id)`: Remove ticket
- `setSelectedTicket(ticket)`: Set currently selected ticket
- `setFilters(filters)`: Update filter settings
- `clearFilters()`: Reset all filters

### 3. Calls Slice (`callsSlice.ts`)
Manages live call data, transcription, and AI assistance.

**State:**
- `activeCalls`: Array of currently active calls
- `selectedCall`: Currently selected call
- `callHistory`: Array of completed calls
- `isRecording`: Recording status
- `connectionStatus`: WebSocket connection status
- `ragMode`: AI assistance mode (newbie/intermediate/experienced)

**Actions:**
- `setActiveCalls(calls[])`: Set active calls
- `addActiveCall(call)`: Add new active call
- `updateCall({id, updates})`: Update call data
- `endCall(id)`: Move call to history
- `addTranscriptSegment({callId, segment})`: Add transcript segment
- `addAIAssistance({callId, assistance})`: Add AI suggestion
- `setRagMode(mode)`: Change AI assistance mode

### 4. Analytics Slice (`analyticsSlice.ts`)
Manages dashboard metrics, performance data, and analytics reports.

**State:**
- `dashboardMetrics`: Main dashboard data including call metrics, sentiment analysis, agent performance, and script adherence
- `detailedReports`: Array of detailed analytics reports
- `selectedTimeRange`: Current time range filter (24h/7d/30d/90d)
- `autoRefresh`: Auto-refresh setting

**Actions:**
- `setDashboardMetrics(metrics)`: Set complete dashboard data
- `updateCallMetrics(metrics)`: Update call metrics
- `updateSentimentAnalysis(data)`: Update sentiment data
- `updateAgentPerformance(agents[])`: Update agent performance data
- `setSelectedTimeRange(range)`: Change time range filter
- `refreshMetrics()`: Trigger metrics refresh

## Usage Examples

### Basic Usage with Typed Hooks

```tsx
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setUser, logout } from '../store/userSlice';
import { addTicket } from '../store/ticketsSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);
  const tickets = useAppSelector(state => state.tickets.tickets);
  
  const handleLogin = (userData) => {
    dispatch(setUser(userData));
  };
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    // Your component JSX
  );
};
```

### Selectors for Computed Data

```tsx
// Create reusable selectors
const selectActiveTickets = (state: RootState) => 
  state.tickets.tickets.filter(ticket => ticket.status !== 'closed');

const selectCurrentCallTranscript = (state: RootState) => 
  state.calls.selectedCall?.transcript || [];

// Use in components
const activeTickets = useAppSelector(selectActiveTickets);
const transcript = useAppSelector(selectCurrentCallTranscript);
```

## Best Practices

### 1. State Structure
- Keep state normalized (avoid deeply nested objects)
- Use TypeScript interfaces for all state shapes
- Separate loading/error states per slice

### 2. Actions
- Use descriptive action names that describe what happened
- Include all necessary data in action payloads
- Use PayloadAction<T> for type safety

### 3. Selectors
- Create reusable selector functions for computed data
- Use memoization for expensive computations (with reselect if needed)
- Keep selectors close to where they're used or in a shared selectors file

### 4. Error Handling
- Always include error states in slices
- Clear errors when starting new operations
- Provide user-friendly error messages

### 5. Real-time Updates
- Use WebSocket connections for live call data
- Update state incrementally for transcript segments
- Batch updates when possible to avoid excessive re-renders

## Adding New Slices

1. Create a new slice file in `src/store/`
2. Define TypeScript interfaces for state and payloads
3. Create the slice with createSlice()
4. Export actions and reducer
5. Add reducer to store configuration in `store.ts`
6. Update this README with documentation

## Integration Points

### WebSocket Integration
The calls slice is designed to work with WebSocket connections for real-time updates:
- `addTranscriptSegment` for live transcription
- `addAIAssistance` for real-time AI suggestions
- `setConnectionStatus` for connection monitoring

### API Integration
Each slice includes loading and error states for API integration:
- Set loading to true before API calls
- Set data and clear loading/error on success
- Set error and clear loading on failure

## Performance Considerations

- Use React.memo() for components that don't need frequent re-renders
- Consider using useCallback() and useMemo() for expensive operations
- Batch related state updates when possible
- Monitor Redux DevTools for unnecessary re-renders
