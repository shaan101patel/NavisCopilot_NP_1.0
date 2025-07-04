import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback, useEffect } from "react";
import { GripHorizontal, Plus, Edit3, Trash2, List, StickyNote, Send, Settings, ChevronUp, Phone, PhoneCall, PhoneOff, Users, Search, Copy, Check } from "lucide-react";

// IMPLEMENT LATER: Replace with real-time call and transcript data from backend (Supabase).
// Expected data: 
// - callId: string (unique identifier for the current call)
// - callStartTime: Date (when the call started)
// - participantInfo: { agent: string, customer: string, customerPhone?: string }
// - transcript: Array<{ id: string, speaker: 'Agent' | 'Customer', text: string, timestamp: Date }>
// - callStatus: 'active' | 'on-hold' | 'ended'
const mockTranscript = [
  { id: "1", speaker: "Agent", text: "Hello, thank you for calling Navis support. How can I help you today?", timestamp: new Date() },
  { id: "2", speaker: "Customer", text: "Hi, I need help with my order.", timestamp: new Date() },
  { id: "3", speaker: "Agent", text: "I'd be happy to help you with your order. Can you please provide me with your order number?", timestamp: new Date() },
  { id: "4", speaker: "Customer", text: "Sure, it's ORD-12345.", timestamp: new Date() },
];

// IMPLEMENT LATER: Replace with real AI suggestions from backend RAG system.
// Expected data:
// - suggestions: Array<{ id: string, text: string, priority: 'high' | 'medium' | 'low', category: string }>
// - scriptMode: 'newbie' | 'intermediate' | 'experienced'
// - contextualHelp: string (based on current conversation context)
const mockAISuggestions = [
  "Ask for the customer's order number.",
  "Offer to check the order status in the system.",
  "Provide order tracking information.",
];

// IMPLEMENT LATER: Replace with real notes data from backend (Supabase).
// Expected data:
// - notes: Array<{ id: string, content: string, createdAt: Date, updatedAt: Date, color?: string }>
// - Auto-save functionality every few seconds
// - Real-time collaboration if multiple agents are involved
const mockNotes = [
  { id: "note-1", content: "Customer mentioned previous issue with shipping", createdAt: new Date(), color: "yellow" },
  { id: "note-2", content: "Check order status in system", createdAt: new Date(), color: "blue" },
  { id: "note-3", content: "Customer prefers email updates over phone calls", createdAt: new Date(), color: "green" },
  { id: "note-4", content: "Follow up needed within 24 hours", createdAt: new Date(), color: "pink" },
];

type AiResponseLevel = 'instant' | 'quick' | 'immediate';

type ChatMessage = {
  id: string;
  content: string;
  sender: 'agent' | 'ai';
  timestamp: Date;
  aiResponseLevel?: AiResponseLevel;
  isTyping?: boolean;
};

// IMPLEMENT LATER: Replace with real chat messages from backend AI system.
// Expected data structure:
// - messages: Array<ChatMessage>
// - Real-time message streaming via WebSocket
// - AI response integration with RAG system
// - Message persistence and history retrieval
const mockChatMessages: ChatMessage[] = [
  { id: "msg-1", content: "What's the best way to handle shipping complaints?", sender: "agent", timestamp: new Date(Date.now() - 300000) },
  { id: "msg-2", content: "For shipping complaints, first acknowledge the issue, then check the tracking status in our system. Offer immediate solutions like expedited shipping or refunds based on company policy.", sender: "ai", timestamp: new Date(Date.now() - 250000), aiResponseLevel: "quick" },
  { id: "msg-3", content: "How should I handle the refund process?", sender: "agent", timestamp: new Date(Date.now() - 120000) },
];

export default function LiveCall() {
  // IMPLEMENT LATER: Fetch live call data, transcript, and AI suggestions for the active call.
  const [transcript] = useState(mockTranscript);
  const [aiSuggestions] = useState(mockAISuggestions);
  const [notes, setNotes] = useState(mockNotes);
  const [notesViewMode, setNotesViewMode] = useState<'sticky' | 'bullet'>('sticky');
  
  // Chat functionality state
  const [chatMessages, setChatMessages] = useState(mockChatMessages);
  const [newMessage, setNewMessage] = useState('');
  const [aiResponseLevel, setAiResponseLevel] = useState<AiResponseLevel>('quick');
  const [showAiLevelDropup, setShowAiLevelDropup] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  // Call control state
  const [showCallControls, setShowCallControls] = useState(false);
  const [callStartTime] = useState(new Date(Date.now() - 204000)); // Call started 3:24 ago
  const [callDuration, setCallDuration] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  
  // Transfer functionality state
  const [showTransferDropdown, setShowTransferDropdown] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  
  // Copy functionality state for transcript entries
  const [copiedTranscriptIds, setCopiedTranscriptIds] = useState<Set<string>>(new Set());
  
  // IMPLEMENT LATER: Replace with real agent data from backend user management system
  // Expected data structure:
  // - agents: Array<{ 
  //     id: string, 
  //     name: string, 
  //     email: string,
  //     status: 'available' | 'busy' | 'away' | 'offline',
  //     department: string,
  //     skillLevel: 'junior' | 'senior' | 'lead',
  //     currentCallCount: number,
  //     maxConcurrentCalls: number,
  //     transferCapability: boolean
  //   }>
  // - departmentAgents: grouped by department for easy filtering
  // - availabilityMatrix: real-time status updates via WebSocket
  const mockAvailableAgents = [
    { id: 'agent-1', name: 'Sarah Johnson', status: 'available', department: 'Customer Support', skillLevel: 'senior' },
    { id: 'agent-2', name: 'Mike Chen', status: 'available', department: 'Technical Support', skillLevel: 'lead' },
    { id: 'agent-3', name: 'Emily Rodriguez', status: 'busy', department: 'Customer Support', skillLevel: 'junior' },
    { id: 'agent-4', name: 'David Kim', status: 'available', department: 'Sales', skillLevel: 'senior' },
    { id: 'agent-5', name: 'Lisa Thompson', status: 'away', department: 'Technical Support', skillLevel: 'senior' },
  ];
  
  // Filter agents based on search query
  const filteredAgents = mockAvailableAgents.filter(agent =>
    agent.name.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
    agent.department.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
    agent.skillLevel.toLowerCase().includes(agentSearchQuery.toLowerCase())
  );
  
  // IMPLEMENT LATER: Replace with real call data from backend call management system
  // Expected data:
  // - callId: string (unique identifier for current call)
  // - callStatus: 'active' | 'on-hold' | 'ringing' | 'ended'
  // - participantInfo: { agentId: string, customerId: string, customerPhone: string }
  // - callStartTime: Date
  // - callMetrics: { duration: number, holdTime?: number, transferCount?: number }
  const [isCallActive] = useState(true);
  
  // State for the draggable divider
  const [transcriptHeight, setTranscriptHeight] = useState(60); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Handle dragging for the horizontal divider
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const mouseY = e.clientY - containerRect.top;
    const newPercentage = (mouseY / containerHeight) * 100;
    
    // Constrain between 20% and 80%
    const constrainedPercentage = Math.max(20, Math.min(80, newPercentage));
    setTranscriptHeight(constrainedPercentage);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach global mouse events when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // IMPLEMENT LATER: Connect to backend for note operations
  const addNote = () => {
    // IMPLEMENT LATER: Create new note in backend and update local state
    const newNote = {
      id: `note-${Date.now()}`,
      content: "New note...",
      createdAt: new Date(),
      color: "yellow"
    };
    setNotes([...notes, newNote]);
  };

  const updateNote = (id: string, content: string) => {
    // IMPLEMENT LATER: Update note in backend
    setNotes(notes.map(note => 
      note.id === id ? { ...note, content, updatedAt: new Date() } : note
    ));
  };

  const deleteNote = (id: string) => {
    // IMPLEMENT LATER: Delete note from backend
    setNotes(notes.filter(note => note.id !== id));
  };

  // IMPLEMENT LATER: Connect to backend AI chat system
  const sendChatMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      sender: 'agent',
      timestamp: new Date(),
    };

    // Add user message immediately
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsAiTyping(true);

    // IMPLEMENT LATER: Send message to AI backend with selected response level
    // Expected API call:
    // - Endpoint: POST /api/ai/chat
    // - Payload: { message: string, responseLevel: AiResponseLevel, callContext: CallContext }
    // - Response: { message: string, suggestions?: string[], confidence: number }
    // - WebSocket for real-time streaming responses
    
    // Simulate AI response (REMOVE when backend is ready)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        content: `AI Response (${aiResponseLevel} mode): Based on your query, I recommend checking the customer's order history and offering appropriate compensation.`,
        sender: 'ai',
        timestamp: new Date(),
        aiResponseLevel,
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setIsAiTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  // Close dropup when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowAiLevelDropup(false);
    if (showAiLevelDropup) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showAiLevelDropup]);

  // Close transfer dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.transfer-dropdown-container')) {
        setShowTransferDropdown(false);
      }
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowTransferDropdown(false);
        setSelectedAgent('');
        setAgentSearchQuery('');
      }
    };
    
    if (showTransferDropdown) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showTransferDropdown]);

  // Update call duration timer
  useEffect(() => {
    const updateDuration = () => {
      const now = new Date();
      const diffMs = now.getTime() - callStartTime.getTime();
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      setCallDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateDuration(); // Initial call
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [callStartTime]);

  // Clear selected agent if it's not in filtered results
  useEffect(() => {
    if (selectedAgent && !filteredAgents.find(agent => agent.id === selectedAgent)) {
      setSelectedAgent('');
    }
  }, [filteredAgents, selectedAgent]);

  // IMPLEMENT LATER: Connect to backend call control system
  const handleHangUp = () => {
    // IMPLEMENT LATER: End current call
    // Expected API call:
    // - Endpoint: POST /api/calls/{callId}/end
    // - Payload: { endReason: 'agent_hangup', callSummary?: string }
    // - Response: { success: boolean, callId: string, endedAt: Date }
    // - Update call status in database
    // - Clean up real-time connections (WebSocket, WebRTC)
    console.log('Hanging up call...');
    setShowCallControls(false);
  };

  const handleTransfer = () => {
    // Show transfer dropdown instead of closing modal
    setShowTransferDropdown(true);
  };

  const handleConfirmTransfer = () => {
    if (!selectedAgent) return;
    
    // IMPLEMENT LATER: Execute call transfer to selected agent
    // Expected API call:
    // - Endpoint: POST /api/calls/{callId}/transfer
    // - Payload: { 
    //     targetAgentId: string,
    //     transferType: 'warm' | 'cold',
    //     transferReason?: string,
    //     customerConsent: boolean,
    //     notes?: string
    //   }
    // - Response: { 
    //     transferId: string, 
    //     status: 'initiated' | 'connecting' | 'completed' | 'failed',
    //     targetAgent: AgentInfo,
    //     estimatedWaitTime?: number
    //   }
    // - WebSocket events: 'transfer-initiated', 'transfer-accepted', 'transfer-completed'
    // - Update call participants and routing
    // - Handle transfer notifications to both agents
    // - Log transfer event for analytics and quality assurance
    console.log(`Transferring call to agent: ${selectedAgent}...`);
    setShowTransferDropdown(false);
    setSelectedAgent('');
    setAgentSearchQuery('');
    setShowCallControls(false);
  };

  const handleCancelTransfer = () => {
    setShowTransferDropdown(false);
    setSelectedAgent('');
    setAgentSearchQuery('');
  };

  const handleNewCall = () => {
    if (!newPhoneNumber.trim()) return;
    
    // IMPLEMENT LATER: Initiate new outbound call
    // Expected API call:
    // - Endpoint: POST /api/calls/outbound
    // - Payload: { phoneNumber: string, agentId: string, callType: 'follow_up' | 'new_inquiry' }
    // - Response: { callId: string, status: 'dialing' | 'ringing' | 'connected', sessionInfo: CallSession }
    // - Validate phone number format
    // - Check agent availability and permissions
    // - Initialize WebRTC connection
    // - Create new call record in database
    console.log(`Calling ${newPhoneNumber}...`);
    setNewPhoneNumber('');
    setShowCallControls(false);
  };

  // Copy transcript entry to clipboard
  const copyTranscriptToClipboard = async (transcriptId: string, text: string, speaker: string, timestamp: Date) => {
    try {
      // Format the text with speaker and timestamp for better context
      const formattedText = `[${timestamp.toLocaleTimeString()}] ${speaker}: ${text}`;
      
      // Use modern Clipboard API for reliable copying across browsers
      // FEATURE: Copy individual transcript lines to clipboard for easy reference
      // PURPOSE: Allows agents to quickly copy specific parts of conversation for:
      // - Adding to call notes or tickets
      // - Sharing key customer statements with supervisors
      // - Documentation and follow-up actions
      // - Quality assurance and training purposes
      await navigator.clipboard.writeText(formattedText);
      
      // Provide visual feedback that copy was successful
      setCopiedTranscriptIds(prev => new Set(prev).add(transcriptId));
      
      // Clear the feedback after 2 seconds
      setTimeout(() => {
        setCopiedTranscriptIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(transcriptId);
          return newSet;
        });
      }, 2000);
      
    } catch (err) {
      // Fallback for browsers that don't support Clipboard API
      console.warn('Clipboard API not available, falling back to execCommand');
      try {
        const textArea = document.createElement('textarea');
        textArea.value = `[${timestamp.toLocaleTimeString()}] ${speaker}: ${text}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Still provide visual feedback
        setCopiedTranscriptIds(prev => new Set(prev).add(transcriptId));
        setTimeout(() => {
          setCopiedTranscriptIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(transcriptId);
            return newSet;
          });
        }, 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy text to clipboard:', fallbackErr);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-200px)]">
      {/* Header with Call Controls */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading text-foreground">Live Call</h1>
        <Button 
          onClick={() => setShowCallControls(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Settings size={18} />
          Call Controls
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        {/* Left pane: Transcript and Notes with draggable divider */}
        <div className="flex flex-col h-full">
          <Card className="flex-1 flex flex-col overflow-hidden" ref={containerRef}>
            {/* Transcript Section */}
            <div 
              className="flex flex-col overflow-hidden"
              style={{ height: `${transcriptHeight}%` }}
            >
              <div className="p-4 border-b border-border">
                <h2 className="text-xl font-semibold text-card-foreground">Live Transcript</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-muted/30">
                {/* IMPLEMENT LATER: Stream real-time transcript data here with WebSocket connection */}
                {/* Expected WebSocket events: 'transcript-update', 'speaker-change', 'call-status-change' */}
                <div className="space-y-3">
                  {transcript.map((entry) => (
                    <div key={entry.id} className="group relative">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold text-sm ${
                          entry.speaker === 'Agent' ? 'text-primary' : 'text-orange-600'
                        }`}>
                          {entry.speaker}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="bg-card rounded-lg p-3 shadow-sm border border-border relative">
                        <div className="pr-8">
                          {entry.text}
                        </div>
                        
                        {/* Copy Button - always visible on mobile, appears on hover on desktop */}
                        <button
                          onClick={() => copyTranscriptToClipboard(entry.id, entry.text, entry.speaker, entry.timestamp)}
                          className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 hover:bg-background border border-border shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                          title={copiedTranscriptIds.has(entry.id) ? "Copied!" : "Copy transcript line"}
                          aria-label={`Copy transcript line: ${entry.text.substring(0, 50)}${entry.text.length > 50 ? '...' : ''}`}
                        >
                          {copiedTranscriptIds.has(entry.id) ? (
                            <Check size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} className="text-muted-foreground hover:text-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Draggable Divider */}
            <div 
              className="flex items-center justify-center h-3 bg-border hover:bg-primary/20 cursor-row-resize transition-colors"
              onMouseDown={handleMouseDown}
            >
              <GripHorizontal size={16} className="text-gray-500" />
            </div>

            {/* Notes Section */}
            <div 
              className="flex flex-col overflow-hidden"
              style={{ height: `${100 - transcriptHeight}%` }}
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-semibold text-card-foreground">Call Notes</h2>
                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex border border-border rounded-md overflow-hidden">
                    <Button 
                      variant={notesViewMode === 'sticky' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setNotesViewMode('sticky')}
                      className="rounded-none border-none"
                    >
                      <StickyNote size={16} />
                    </Button>
                    <Button 
                      variant={notesViewMode === 'bullet' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setNotesViewMode('bullet')}
                      className="rounded-none border-none"
                    >
                      <List size={16} />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addNote}
                    className="flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Note
                  </Button>
                </div>
              </div>
              <div 
                className="flex-1 overflow-y-auto p-4 bg-muted/30 max-h-96 scrollbar-thin"
              >
                {/* IMPLEMENT LATER: Connect to backend for real-time note synchronization */}
                {/* Expected features: auto-save, real-time collaboration, note categories, search */}
                
                {notesViewMode === 'sticky' ? (
                  // Sticky Notes View
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {notes.map((note) => (
                      <div 
                        key={note.id}
                        className={`relative p-3 rounded-lg shadow-md transition-all hover:shadow-lg ${
                          note.color === 'yellow' ? 'bg-yellow-200 dark:bg-yellow-800/40 dark:text-yellow-100' :
                          note.color === 'blue' ? 'bg-blue-200 dark:bg-blue-800/40 dark:text-blue-100' :
                          note.color === 'green' ? 'bg-green-200 dark:bg-green-800/40 dark:text-green-100' :
                          'bg-pink-200 dark:bg-pink-800/40 dark:text-pink-100'
                        }`}
                        style={{
                          transform: `rotate(${Math.random() * 4 - 2}deg)`,
                        }}
                      >
                        <textarea
                          className="w-full bg-transparent border-none resize-none text-sm placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none"
                          value={note.content}
                          onChange={(e) => updateNote(note.id, e.target.value)}
                          placeholder="Add a note..."
                          rows={3}
                        />
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-300">
                          <span>{note.createdAt.toLocaleTimeString()}</span>
                          <div className="flex gap-1">
                            <button 
                              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                              title="Edit note"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button 
                              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded text-red-600 dark:text-red-400"
                              onClick={() => deleteNote(note.id)}
                              title="Delete note"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Bullet List View
                  <div 
                    className="bg-card border border-border rounded-lg p-6 shadow-sm min-h-full overflow-y-auto max-h-96 scrollbar-thin"
                  >
                    <div className="prose prose-sm max-w-none">
                      <h3 className="text-lg font-semibold mb-4 text-card-foreground">Call Notes Summary</h3>
                      {notes.length === 0 ? (
                        <p className="text-muted-foreground italic">No notes yet. Add some notes to see them as bullet points here.</p>
                      ) : (
                        <ul className="space-y-3">
                          {notes.map((note, index) => (
                            <li key={note.id} className="group">
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <div className="text-card-foreground leading-relaxed">
                                    {note.content || "Empty note"}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Added at {note.createdAt.toLocaleTimeString()}
                                  </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <button 
                                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                    title="Edit note"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button 
                                    className="p-1 hover:bg-muted rounded text-red-600 dark:text-red-400"
                                    onClick={() => deleteNote(note.id)}
                                    title="Delete note"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              {index < notes.length - 1 && <hr className="mt-3 border-border" />}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right pane: AI Chat & Suggestions */}
        <Card className="p-6 flex flex-col gap-4 h-full">
          <h2 className="text-xl font-semibold mb-2 text-card-foreground">AI Assistant & Chat</h2>
          
          {/* Static AI Suggestions */}
          <div className="border-b border-border pb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Suggestions</h3>
            {/* IMPLEMENT LATER: Display dynamic RAG output based on call context and agent experience level */}
            {/* Expected AI features: real-time suggestions, context-aware responses, sentiment analysis */}
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, idx) => (
                <div key={idx} className="p-2 bg-muted rounded text-xs border-l-2 border-primary">
                  {suggestion}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">AI Chat</h3>
              <div className="text-xs text-muted-foreground">
                Mode: <span className="capitalize font-medium text-primary">{aiResponseLevel}</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto bg-muted/30 rounded-lg p-3 mb-3 min-h-0 max-h-80 scrollbar-thin">
              {/* IMPLEMENT LATER: Load chat history from backend and implement real-time messaging */}
              {/* Expected WebSocket events: 'message-received', 'ai-typing', 'message-delivered' */}
              <div className="space-y-3">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        message.sender === 'agent'                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-card border border-border rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <div className="break-words">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.sender === 'agent' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {message.aiResponseLevel && (
                          <span className="ml-2 capitalize">({message.aiResponseLevel})</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* AI Typing Indicator */}
                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border rounded-lg rounded-bl-sm shadow-sm p-3 text-sm">
                      <div className="flex items-center gap-1">
                        <span>AI is typing</span>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask the AI assistant anything..."
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring bg-background"
                  rows={2}
                />
              </div>
              
              {/* AI Response Level Selector */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAiLevelDropup(!showAiLevelDropup);
                  }}
                  className="h-full px-2"
                  title="AI Response Level"
                >
                  <Settings size={16} />
                </Button>
                
                {/* Drop-up Menu */}
                {showAiLevelDropup && (
                  <div className="absolute bottom-full right-0 mb-2 bg-popover border border-border rounded-lg shadow-lg py-2 min-w-32 z-50">
                    <div className="px-3 py-1 text-xs font-medium text-muted-foreground border-b border-border mb-1">
                      AI Answer:
                    </div>
                    {(['instant', 'quick', 'immediate'] as AiResponseLevel[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => {
                          setAiResponseLevel(level);
                          setShowAiLevelDropup(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors capitalize ${
                          aiResponseLevel === level ? 'bg-accent/50 text-accent-foreground font-medium' : 'text-popover-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{level}</span>
                          {aiResponseLevel === level && (
                            <span className="text-primary">✓</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <Button
                onClick={sendChatMessage}
                disabled={!newMessage.trim() || isAiTyping}
                size="sm"
                className="h-full px-3"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>

          {/* Experience Level Controls */}
          {/* IMPLEMENT LATER: Add controls to switch between "newbie," "intermediate," and "experienced" script modes */}
          {/* Expected backend integration: user preference storage, script customization per experience level */}
          <div className="border-t border-border pt-4">
            <div className="text-sm font-medium mb-3">Experience Level</div>
            <div className="flex gap-2">
              <Button variant="outline" disabled className="flex-1 text-xs">
                Newbie
              </Button>
              <Button variant="outline" disabled className="flex-1 text-xs">
                Intermediate
              </Button>
              <Button variant="outline" disabled className="flex-1 text-xs">
                Experienced
              </Button>
            </div>
            {/* IMPLEMENT LATER: Enable buttons and update script output based on selection */}
          </div>
        </Card>
      </div>

      {/* Call Control Modal */}
      {showCallControls && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-popover border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-popover-foreground">Call Controls</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCallControls(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>

            {/* Call Status */}
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-green-800 dark:text-green-400">Call Active</span>
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Call Length: {callDuration}
              </div>
            </div>

            {/* Call Control Actions */}
            <div className="space-y-4">
              {/* Primary Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleHangUp}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <PhoneOff size={18} />
                  Hang Up
                </Button>
                <div className="relative transfer-dropdown-container">
                  <Button
                    onClick={handleTransfer}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <Users size={18} />
                    Transfer
                  </Button>
                  
                  {/* Transfer Dropdown */}
                  {showTransferDropdown && (
                    <div 
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                      role="listbox"
                      aria-label="Available agents for transfer"
                    >
                      <div className="p-3 border-b border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Transfer Call To:</h4>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="Search agents..."
                            value={agentSearchQuery}
                            onChange={(e) => setAgentSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Select an available agent to transfer the call</p>
                      </div>
                      
                      <div className="py-2">
                        {/* IMPLEMENT LATER: Fetch available agents from backend API */}
                        {/* Expected API call: GET /api/agents/available?department=all&skillLevel=any */}
                        {/* Filter by: availability, department, skill level, call capacity */}
                        {/* Real-time updates via WebSocket for agent status changes */}
                        {/* Search functionality: filter by name, department, skill level */}
                        {filteredAgents.map((agent) => (
                          <button
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent.id)}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                              selectedAgent === agent.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                            } ${agent.status !== 'available' ? 'opacity-60 cursor-not-allowed' : ''}`}
                            disabled={agent.status !== 'available'}
                            role="option"
                            aria-selected={selectedAgent === agent.id}
                            aria-describedby={`agent-${agent.id}-status`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {agent.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {agent.department} • {agent.skillLevel}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  agent.status === 'available' ? 'bg-green-500' : 
                                  agent.status === 'busy' ? 'bg-red-500' : 
                                  'bg-yellow-500'
                                }`}></div>
                                <span 
                                  id={`agent-${agent.id}-status`}
                                  className={`text-xs capitalize ${
                                    agent.status === 'available' ? 'text-green-600' : 
                                    agent.status === 'busy' ? 'text-red-600' : 
                                    'text-yellow-600'
                                  }`}
                                >
                                  {agent.status}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                        
                        {filteredAgents.length === 0 && agentSearchQuery ? (
                          <div className="px-3 py-4 text-center text-sm text-gray-500">
                            No agents found matching "{agentSearchQuery}"
                          </div>
                        ) : filteredAgents.filter(agent => agent.status === 'available').length === 0 && filteredAgents.length > 0 ? (
                          <div className="px-3 py-4 text-center text-sm text-gray-500">
                            No available agents found{agentSearchQuery ? ` for "${agentSearchQuery}"` : ''}
                          </div>
                        ) : filteredAgents.length === 0 ? (
                          <div className="px-3 py-4 text-center text-sm text-gray-500">
                            No agents currently available for transfer
                          </div>
                        ) : null}
                      </div>
                      
                      {/* Transfer Actions */}
                      <div className="p-3 border-t border-gray-200 flex gap-2">
                        <Button
                          onClick={handleCancelTransfer}
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleConfirmTransfer}
                          disabled={!selectedAgent || !filteredAgents.find(a => a.id === selectedAgent && a.status === 'available')}
                          size="sm"
                          className="flex-1"
                        >
                          Confirm Transfer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* New Call Section */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Make New Call</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="phone-input" className="block text-sm font-medium text-gray-700 mb-1">
                      Enter Phone
                    </label>
                    <input
                      id="phone-input"
                      type="tel"
                      value={newPhoneNumber}
                      onChange={(e) => setNewPhoneNumber(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <Button
                    onClick={handleNewCall}
                    disabled={!newPhoneNumber.trim()}
                    className="w-full flex items-center gap-2"
                  >
                    <Phone size={18} />
                    Call
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => setShowCallControls(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
