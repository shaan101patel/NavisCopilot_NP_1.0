import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TranscriptSegment {
  id: string;
  speaker: 'agent' | 'customer';
  text: string;
  timestamp: string;
  confidence: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface AIAssistance {
  id: string;
  type: 'suggestion' | 'script' | 'knowledge' | 'warning';
  content: string;
  relevanceScore: number;
  timestamp: string;
  isActive: boolean;
}

interface Call {
  id: string;
  customerName?: string;
  customerPhone: string;
  agentId: string;
  status: 'incoming' | 'active' | 'on-hold' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  duration?: number;
  transcript: TranscriptSegment[];
  aiAssistance: AIAssistance[];
  tags: string[];
  notes: string;
  ticketId?: string;
}

interface CallsState {
  activeCalls: Call[];
  selectedCall: Call | null;
  callHistory: Call[];
  isRecording: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  loading: boolean;
  error: string | null;
  ragMode: 'newbie' | 'intermediate' | 'experienced';
}

const initialState: CallsState = {
  activeCalls: [],
  selectedCall: null,
  callHistory: [],
  isRecording: false,
  connectionStatus: 'disconnected',
  loading: false,
  error: null,
  ragMode: 'intermediate',
};

const callsSlice = createSlice({
  name: 'calls',
  initialState,
  reducers: {
    setActiveCalls(state, action: PayloadAction<Call[]>) {
      state.activeCalls = action.payload;
    },
    addActiveCall(state, action: PayloadAction<Call>) {
      state.activeCalls.push(action.payload);
    },
    updateCall(state, action: PayloadAction<{ id: string; updates: Partial<Call> }>) {
      const { id, updates } = action.payload;
      const activeCallIndex = state.activeCalls.findIndex(call => call.id === id);
      if (activeCallIndex !== -1) {
        state.activeCalls[activeCallIndex] = { ...state.activeCalls[activeCallIndex], ...updates };
      }
      if (state.selectedCall?.id === id) {
        state.selectedCall = { ...state.selectedCall, ...updates };
      }
    },
    endCall(state, action: PayloadAction<string>) {
      const callId = action.payload;
      const callIndex = state.activeCalls.findIndex(call => call.id === callId);
      if (callIndex !== -1) {
        const endedCall = { ...state.activeCalls[callIndex], status: 'completed' as const, endTime: new Date().toISOString() };
        state.activeCalls.splice(callIndex, 1);
        state.callHistory.unshift(endedCall);
        if (state.selectedCall?.id === callId) {
          state.selectedCall = null;
        }
      }
    },
    setSelectedCall(state, action: PayloadAction<Call | null>) {
      state.selectedCall = action.payload;
    },
    addTranscriptSegment(state, action: PayloadAction<{ callId: string; segment: TranscriptSegment }>) {
      const { callId, segment } = action.payload;
      const activeCallIndex = state.activeCalls.findIndex(call => call.id === callId);
      if (activeCallIndex !== -1) {
        state.activeCalls[activeCallIndex].transcript.push(segment);
        if (state.selectedCall?.id === callId) {
          state.selectedCall.transcript.push(segment);
        }
      }
    },
    addAIAssistance(state, action: PayloadAction<{ callId: string; assistance: AIAssistance }>) {
      const { callId, assistance } = action.payload;
      const activeCallIndex = state.activeCalls.findIndex(call => call.id === callId);
      if (activeCallIndex !== -1) {
        state.activeCalls[activeCallIndex].aiAssistance.push(assistance);
        if (state.selectedCall?.id === callId) {
          state.selectedCall.aiAssistance.push(assistance);
        }
      }
    },
    updateAIAssistance(state, action: PayloadAction<{ callId: string; assistanceId: string; updates: Partial<AIAssistance> }>) {
      const { callId, assistanceId, updates } = action.payload;
      const activeCallIndex = state.activeCalls.findIndex(call => call.id === callId);
      if (activeCallIndex !== -1) {
        const assistanceIndex = state.activeCalls[activeCallIndex].aiAssistance.findIndex(ai => ai.id === assistanceId);
        if (assistanceIndex !== -1) {
          state.activeCalls[activeCallIndex].aiAssistance[assistanceIndex] = {
            ...state.activeCalls[activeCallIndex].aiAssistance[assistanceIndex],
            ...updates
          };
        }
      }
    },
    setRecording(state, action: PayloadAction<boolean>) {
      state.isRecording = action.payload;
    },
    setConnectionStatus(state, action: PayloadAction<CallsState['connectionStatus']>) {
      state.connectionStatus = action.payload;
    },
    setRagMode(state, action: PayloadAction<CallsState['ragMode']>) {
      state.ragMode = action.payload;
    },
    setCallHistory(state, action: PayloadAction<Call[]>) {
      state.callHistory = action.payload;
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
  },
});

export const {
  setActiveCalls,
  addActiveCall,
  updateCall,
  endCall,
  setSelectedCall,
  addTranscriptSegment,
  addAIAssistance,
  updateAIAssistance,
  setRecording,
  setConnectionStatus,
  setRagMode,
  setCallHistory,
  setLoading,
  setError,
  clearError,
} = callsSlice.actions;

export default callsSlice.reducer;
