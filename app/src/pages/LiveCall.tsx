import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useCallback, useEffect } from "react";
import { GripHorizontal, Plus, Edit3, Trash2, List, StickyNote, Send, Settings, ChevronUp, Phone, PhoneCall, PhoneOff, Users, Search, Copy, Check, Monitor, Share, Ticket, X, AlertCircle, Zap, Info } from "lucide-react";

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
// Expected data structure for quick suggestion:
// interface QuickSuggestion {
//   id: string;
//   message: string;
//   context: 'customer_question' | 'manual_trigger' | 'call_event';
//   confidence: number;
//   timestamp: Date;
//   callId: string;
//   triggerData?: {
//     customerMessage?: string;
//     conversationContext?: string;
//     customerSentiment?: 'positive' | 'neutral' | 'negative';
//   };
// }
// 
// Automatic generation triggers:
// - Customer asks a question (detected via transcript analysis)
// - Customer expresses frustration or confusion
// - Long pause in conversation
// - Agent requests help via chat
// 
// Backend integration:
// - POST /api/ai/quick-suggestion/generate
// - WebSocket event: 'customer-question-detected'
// - Real-time transcript analysis for trigger detection
const mockQuickSuggestion = "Ask for the customer's order number to help track their shipment status.";  // IMPLEMENT LATER: Replace with real notes data from backend (Supabase).
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
  const [quickSuggestion, setQuickSuggestion] = useState(mockQuickSuggestion);
  const [notes, setNotes] = useState(mockNotes);
  const [notesViewMode, setNotesViewMode] = useState<'sticky' | 'document'>('sticky');
  
  // Document-style notes editor state
  const [documentNotes, setDocumentNotes] = useState('');
  
  // Copy functionality state for sticky notes
  const [copiedNoteIds, setCopiedNoteIds] = useState<Set<string>>(new Set());
  
  // Quick suggestion state
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  
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
  
  // Copy all functionality state
  const [copiedAllNotes, setCopiedAllNotes] = useState(false);
  const [copiedAllDocument, setCopiedAllDocument] = useState(false);
  
  // Screen sharing state
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);
  
  // Create ticket modal state
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    issueTitle: '',
    issueDescription: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'general' as 'general' | 'technical' | 'billing' | 'account' | 'other',
    callId: '',
    agentNotes: ''
  });
  
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

  // Copy button: Copies the content of this sticky note to clipboard.
  const copyStickyNoteToClipboard = async (noteId: string, content: string) => {
    try {
      // Use modern Clipboard API for reliable copying across browsers
      await navigator.clipboard.writeText(content);
      
      // Provide visual feedback that copy was successful
      setCopiedNoteIds(prev => new Set(prev).add(noteId));
      
      // Clear the feedback after 2 seconds
      setTimeout(() => {
        setCopiedNoteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(noteId);
          return newSet;
        });
      }, 2000);
      
    } catch (err) {
      // Fallback for browsers that don't support Clipboard API
      console.warn('Clipboard API not available, falling back to execCommand');
      try {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Still provide visual feedback
        setCopiedNoteIds(prev => new Set(prev).add(noteId));
        setTimeout(() => {
          setCopiedNoteIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(noteId);
            return newSet;
          });
        }, 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy sticky note to clipboard:', fallbackErr);
      }
    }
  };

  // Copy all sticky notes to clipboard
  const copyAllStickyNotes = async () => {
    try {
      // Format all notes with timestamps and separators
      const allNotesText = notes.map((note, index) => {
        const timestamp = note.createdAt.toLocaleString();
        return `Note ${index + 1} (${timestamp}):\n${note.content}`;
      }).join('\n\n---\n\n');
      
      const formattedText = `Call Notes Summary - ${new Date().toLocaleString()}\n\n${allNotesText}`;
      
      // Use modern Clipboard API
      await navigator.clipboard.writeText(formattedText);
      
      // Provide visual feedback
      setCopiedAllNotes(true);
      
      // Clear feedback after 2 seconds
      setTimeout(() => {
        setCopiedAllNotes(false);
      }, 2000);
      
    } catch (err) {
      // Fallback for browsers that don't support Clipboard API
      console.warn('Clipboard API not available, falling back to execCommand');
      try {
        const allNotesText = notes.map((note, index) => {
          const timestamp = note.createdAt.toLocaleString();
          return `Note ${index + 1} (${timestamp}):\n${note.content}`;
        }).join('\n\n---\n\n');
        
        const formattedText = `Call Notes Summary - ${new Date().toLocaleString()}\n\n${allNotesText}`;
        
        const textArea = document.createElement('textarea');
        textArea.value = formattedText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Still provide visual feedback
        setCopiedAllNotes(true);
        setTimeout(() => {
          setCopiedAllNotes(false);
        }, 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy all sticky notes to clipboard:', fallbackErr);
      }
    }
  };

  // Copy all document content to clipboard
  const copyAllDocumentNotes = async () => {
    try {
      // Add header and timestamp to document content
      const timestamp = new Date().toLocaleString();
      const formattedContent = `Call Summary & Notes - ${timestamp}\n\n${documentNotes || 'No notes written yet.'}`;
      
      // Use modern Clipboard API
      await navigator.clipboard.writeText(formattedContent);
      
      // Provide visual feedback
      setCopiedAllDocument(true);
      
      // Clear feedback after 2 seconds
      setTimeout(() => {
        setCopiedAllDocument(false);
      }, 2000);
      
    } catch (err) {
      // Fallback for browsers that don't support Clipboard API
      console.warn('Clipboard API not available, falling back to execCommand');
      try {
        const timestamp = new Date().toLocaleString();
        const formattedContent = `Call Summary & Notes - ${timestamp}\n\n${documentNotes || 'No notes written yet.'}`;
        
        const textArea = document.createElement('textarea');
        textArea.value = formattedContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Still provide visual feedback
        setCopiedAllDocument(true);
        setTimeout(() => {
          setCopiedAllDocument(false);
        }, 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy document notes to clipboard:', fallbackErr);
      }
    }
  };

  // IMPLEMENT LATER: Generate AI-powered call summary and insert into the document editor.
  const generateAiNote = async () => {
    // Expected API call:
    // - POST /api/ai/generate-call-summary
    // - Payload: { 
    //     callId: string, 
    //     transcript: TranscriptEntry[], 
    //     existingNotes: string,
    //     summaryType: 'full' | 'action_items' | 'key_points'
    //   }
    // - Response: { 
    //     summary: string, 
    //     actionItems: string[], 
    //     keyInsights: string[],
    //     confidence: number 
    //   }
    // 
    // AI features to implement:
    // 1. Transcript analysis for key conversation points
    // 2. Customer sentiment detection and summary
    // 3. Issue identification and resolution tracking
    // 4. Action items extraction from conversation
    // 5. Follow-up recommendations based on call context
    // 6. Integration with existing document content (append vs replace)
    
    // Mock AI generation for now
    const mockAiSummary = `
Call Summary - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

Customer: Customer from current call
Issue: Order inquiry and shipping concerns

Key Points:
• Customer inquired about order ORD-12345
• Mentioned previous shipping issues
• Prefers email communication over phone calls
• Requires follow-up within 24 hours

Action Items:
• Check order status in system
• Update customer preferences for email notifications
• Schedule follow-up contact within 24 hours
• Review shipping history for improvement opportunities

Resolution: [To be completed]

Agent Notes: Customer was patient and understanding. Issue appears to be related to shipping delays.
`;

    // Insert the generated content into the document editor
    const currentContent = documentNotes;
    const newContent = currentContent 
      ? `${currentContent}\n\n---\n\n${mockAiSummary.trim()}`
      : mockAiSummary.trim();
    
    setDocumentNotes(newContent);
    
    console.log('AI note generated and inserted into document');
  };

  // IMPLEMENT LATER: Generate quick suggestion based on call context
  const generateQuickSuggestion = async () => {
    setIsGeneratingSuggestion(true);
    
    // Expected API call:
    // - POST /api/ai/quick-suggestion/generate
    // - Payload: { 
    //     callId: string,
    //     transcript: TranscriptEntry[],
    //     context: 'manual_trigger',
    //     agentRequest?: string
    //   }
    // - Response: { 
    //     suggestion: string,
    //     confidence: number,
    //     context: string,
    //     id: string
    //   }
    //
    // AI analysis features:
    // 1. Real-time transcript analysis for customer questions
    // 2. Context-aware suggestion generation based on conversation flow
    // 3. Customer sentiment analysis for appropriate response tone
    // 4. Integration with knowledge base for accurate information
    // 5. Personalization based on agent experience level and preferences
    
    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock different suggestions based on call context
      const suggestions = [
        "Apologize for the inconvenience and ask for specific details about the issue.",
        "Offer to escalate to a supervisor if the customer seems frustrated.",
        "Suggest checking the customer's account history for previous interactions.",
        "Recommend providing a reference number for follow-up tracking.",
        "Ask if there's anything else you can help with today."
      ];
      
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      setQuickSuggestion(randomSuggestion);
      
    } catch (error) {
      console.error('Failed to generate quick suggestion:', error);
      setQuickSuggestion("Unable to generate suggestion. Please try again.");
    } finally {
      setIsGeneratingSuggestion(false);
    }
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

  // Screen sharing functionality
  const startScreenShare = async () => {
    try {
      setScreenShareError(null);
      
      // BROWSER COMPATIBILITY: Screen sharing requires:
      // - HTTPS (except localhost for development)
      // - Modern browsers (Chrome 72+, Firefox 66+, Safari 13+, Edge 79+)
      // - Desktop/laptop browsers (mobile browsers have limited support)
      // - User permission granted via browser prompt
      
      // Check if screen sharing is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in this browser. Please use a modern desktop browser with HTTPS.');
      }

      // Request screen sharing with audio capture
      // FEATURE: Capture both video and audio from shared screen/tab
      // PURPOSE: Allows Navis to monitor and transcribe audio from other applications
      // - Customer service representatives can share customer support tools
      // - Audio from other tabs/applications can be captured and analyzed
      // - Screen content can be analyzed for context and assistance
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: {
          // IMPORTANT: Audio capture from other tabs/applications
          // This allows capturing audio from shared browser tabs or applications
          // Browser support varies - some browsers prompt user to select audio source
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      } as any); // Note: getDisplayMedia has different constraints than getUserMedia

      setScreenStream(stream);
      setIsScreenSharing(true);

      // IMPLEMENT LATER: Send screen stream to Navis backend for processing
      // Expected backend integration:
      // 1. WebRTC connection to stream video/audio to backend servers
      // 2. Real-time video analysis for context awareness
      // 3. Audio transcription from shared applications/tabs
      // 4. Screen content OCR for text extraction and analysis
      // 5. AI monitoring for relevant information detection
      // 
      // Backend API endpoints needed:
      // - POST /api/screen-share/start - Initialize screen sharing session
      // - WebSocket /ws/screen-share/{sessionId} - Stream video/audio data
      // - POST /api/screen-share/stop - End screen sharing session
      // 
      // Data structure:
      // {
      //   sessionId: string,
      //   callId: string,
      //   agentId: string,
      //   streamType: 'screen' | 'application' | 'browser',
      //   hasAudio: boolean,
      //   resolution: { width: number, height: number },
      //   startedAt: Date
      // }

      // Listen for when user stops sharing (e.g., clicking "Stop sharing" in browser)
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
      });

      console.log('Screen sharing started successfully');
      console.log('Stream details:', {
        hasVideo: stream.getVideoTracks().length > 0,
        hasAudio: stream.getAudioTracks().length > 0,
        videoSettings: stream.getVideoTracks()[0]?.getSettings(),
        audioSettings: stream.getAudioTracks()[0]?.getSettings()
      });

    } catch (error) {
      console.error('Failed to start screen sharing:', error);
      
      let errorMessage = 'Failed to start screen sharing.';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Screen sharing permission denied. Please allow screen sharing and try again.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Screen sharing is not supported in this browser. Please use Chrome, Firefox, or Edge.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No screen sharing source available. Please try again.';
        } else if (error.name === 'AbortError') {
          errorMessage = 'Screen sharing was cancelled by user.';
        } else {
          errorMessage = error.message || 'An unknown error occurred while starting screen sharing.';
        }
      }
      
      setScreenShareError(errorMessage);
      setIsScreenSharing(false);
      setScreenStream(null);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      // Stop all tracks in the stream
      screenStream.getTracks().forEach(track => {
        track.stop();
      });
      
      // IMPLEMENT LATER: Notify backend that screen sharing has stopped
      // Expected API call:
      // - POST /api/screen-share/stop
      // - Payload: { sessionId: string, endedAt: Date, duration: number }
      // - Cleanup: Remove stream references, update call status, save session data
      
      setScreenStream(null);
    }
    
    setIsScreenSharing(false);
    setScreenShareError(null);
    console.log('Screen sharing stopped');
  };

  // Cleanup screen sharing on component unmount
  useEffect(() => {
    return () => {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [screenStream]);

  // Create ticket functionality
  const handleCreateTicket = () => {
    setShowCreateTicketModal(true);
    
    // Pre-populate form with call information
    setTicketForm(prev => ({
      ...prev,
      callId: `CALL-${Date.now()}`, // Mock call ID
      customerName: 'Customer from current call', // IMPLEMENT LATER: Get from call data
      customerPhone: '+1 (555) 123-4567', // IMPLEMENT LATER: Get from call data
    }));
  };

  const handleTicketFormChange = (field: keyof typeof ticketForm, value: string) => {
    setTicketForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTicketSubmit = () => {
    // IMPLEMENT LATER: Submit ticket to backend
    // Expected API call:
    // - POST /api/tickets
    // - Payload: TicketCreateRequest
    // - Response: { ticketId: string, status: 'created', createdAt: Date }
    // 
    // Backend integration requirements:
    // 1. Ticket validation (required fields, format validation)
    // 2. Customer lookup/creation if new customer
    // 3. Call association (link ticket to current call)
    // 4. Agent assignment rules (auto-assign or manual)
    // 5. Priority-based routing and escalation rules
    // 6. Email notifications to customer and relevant teams
    // 7. Integration with CRM/helpdesk systems
    // 8. Audit trail and ticket history logging
    // 
    // Expected data structure:
    // interface TicketCreateRequest {
    //   customerId?: string;           // Optional if existing customer
    //   customerInfo: {
    //     name: string;
    //     email?: string;
    //     phone?: string;
    //   };
    //   issue: {
    //     title: string;
    //     description: string;
    //     category: TicketCategory;
    //     priority: TicketPriority;
    //   };
    //   callInfo?: {
    //     callId: string;
    //     agentId: string;
    //     callDuration: number;
    //     callTranscript?: string;
    //   };
    //   agentNotes?: string;
    //   attachments?: File[];          // Future: file upload support
    //   tags?: string[];               // Future: tagging system
    // }
    // 
    // Validation requirements:
    // - Customer name: required, 2-100 characters
    // - Issue title: required, 5-200 characters
    // - Issue description: required, 10-2000 characters
    // - Email: valid email format if provided
    // - Phone: valid phone number format if provided
    // - Priority: must be valid enum value
    // - Category: must be valid enum value

    console.log('Creating ticket with data:', ticketForm);
    
    // Mock success behavior
    alert('Ticket created successfully! (This is a mock - no backend integration yet)');
    setShowCreateTicketModal(false);
    
    // Reset form
    setTicketForm({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      issueTitle: '',
      issueDescription: '',
      priority: 'medium',
      category: 'general',
      callId: '',
      agentNotes: ''
    });
  };

  const closeTicketModal = () => {
    setShowCreateTicketModal(false);
    // Don't reset form data in case user wants to reopen and continue
  };

  return (
    <div className="h-[calc(100vh-200px)]">
      {/* Header with Call Controls */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading text-foreground">Live Call</h1>
        <div className="flex items-center gap-3">
          {/* Screen Share Button */}
          <Button 
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            variant={isScreenSharing ? "destructive" : "outline"}
            className="flex items-center gap-2"
            aria-label={isScreenSharing ? "Stop screen sharing" : "Start screen sharing"}
            title={isScreenSharing ? "Stop sharing your screen" : "Share your screen with Navis"}
          >
            {isScreenSharing ? (
              <>
                <Monitor size={18} className="text-white" />
                Stop Sharing
              </>
            ) : (
              <>
                <Share size={18} />
                Share Screen
              </>
            )}
          </Button>

          {/* Create Ticket Button */}
          <Button 
            onClick={handleCreateTicket}
            variant="outline"
            className="flex items-center gap-2"
            aria-label="Create a new support ticket"
            title="Create a new support ticket for this call"
          >
            <Ticket size={18} />
            Create Ticket
          </Button>

          {/* Call Controls Button */}
          <Button 
            onClick={() => setShowCallControls(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Settings size={18} />
            Call Controls
          </Button>
        </div>
      </div>

      {/* Screen Sharing Status Indicator */}
      {isScreenSharing && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-green-800 dark:text-green-400">
              Screen sharing is active
            </span>
            <span className="text-sm text-green-700 dark:text-green-300 ml-2">
              - Navis can see your shared screen and hear audio
            </span>
          </div>
        </div>
      )}

      {/* Screen Sharing Error */}
      {screenShareError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
            <span className="font-medium text-red-800 dark:text-red-400">
              Screen sharing error:
            </span>
            <span className="text-sm text-red-700 dark:text-red-300">
              {screenShareError}
            </span>
          </div>
        </div>
      )}
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
                      title="Switch to sticky notes view"
                      aria-label="Switch to sticky notes view"
                    >
                      <StickyNote size={16} />
                    </Button>
                    <Button 
                      variant={notesViewMode === 'document' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setNotesViewMode('document')}
                      className="rounded-none border-none"
                      title="Switch to document editor view"
                      aria-label="Switch to document editor view"
                    >
                      <List size={16} />
                    </Button>
                  </div>
                  
                  {notesViewMode === 'sticky' ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={addNote}
                        className="flex items-center gap-2"
                        aria-label="Add new sticky note"
                      >
                        <Plus size={16} />
                        Add Note
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={copyAllStickyNotes}
                        className="flex items-center gap-2"
                        aria-label="Copy all sticky notes to clipboard"
                        title="Copy all sticky notes with timestamps"
                      >
                        {copiedAllNotes ? (
                          <>
                            <Check size={16} className="text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            Copy All
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={generateAiNote}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                        aria-label="Generate AI-powered call summary"
                        title="Generate AI summary based on call transcript and notes"
                      >
                        <Plus size={16} />
                        Generate AI Note
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={copyAllDocumentNotes}
                        className="flex items-center gap-2"
                        aria-label="Copy all document content to clipboard"
                        title="Copy entire document with timestamp"
                      >
                        {copiedAllDocument ? (
                          <>
                            <Check size={16} className="text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            Copy All
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div 
                className="flex-1 overflow-y-auto p-4 bg-muted/30 scrollbar-thin"
              >
                {/* IMPLEMENT LATER: Connect to backend for real-time note synchronization */}
                {/* Expected features: auto-save, real-time collaboration, note categories, search */}
                
                {notesViewMode === 'sticky' ? (
                  // Sticky Notes View - Keep UI as is, except replace edit with copy
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
                            {/* Copy button: Copies the content of this sticky note to clipboard. */}
                            <button 
                              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                              onClick={() => copyStickyNoteToClipboard(note.id, note.content)}
                              title={copiedNoteIds.has(note.id) ? "Copied!" : "Copy note content"}
                              aria-label={`Copy sticky note content: ${note.content.substring(0, 30)}${note.content.length > 30 ? '...' : ''}`}
                            >
                              {copiedNoteIds.has(note.id) ? (
                                <Check size={12} className="text-green-600 dark:text-green-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                            <button 
                              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded text-red-600 dark:text-red-400"
                              onClick={() => deleteNote(note.id)}
                              title="Delete note"
                              aria-label="Delete sticky note"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Document-Style Editor - Redesigned as blank document space
                  <div className="h-full">
                    <div 
                      className="bg-background border border-border rounded-lg shadow-sm h-full flex flex-col"
                      style={{ minHeight: '400px' }}
                    >
                      {/* Document Header */}
                      <div className="border-b border-border p-3 bg-muted/50">
                        <h3 className="text-sm font-medium text-foreground">Call Summary & Notes</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Document-style editor for comprehensive call notes
                        </p>
                      </div>
                      
                      {/* Document Editor */}
                      <div className="flex-1 p-0">
                        <textarea
                          value={documentNotes}
                          onChange={(e) => setDocumentNotes(e.target.value)}
                          placeholder="Type your call summary or notes here…

You can freely format and organize your notes in this document-style space. 

Use the 'Generate AI Note' button to automatically create summaries based on the call transcript and existing notes."
                          className="w-full h-full border-none resize-none text-sm leading-relaxed p-4 bg-transparent focus:outline-none placeholder-muted-foreground"
                          style={{ 
                            fontFamily: 'inherit',
                            lineHeight: '1.6',
                            minHeight: '350px'
                          }}
                          aria-label="Document-style call notes editor"
                        />
                      </div>
                      
                      {/* Document Footer */}
                      <div className="border-t border-border p-2 bg-muted/30">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {documentNotes.length} characters
                            {documentNotes.split(/\s+/).filter(word => word.length > 0).length > 0 && 
                              ` • ${documentNotes.split(/\s+/).filter(word => word.length > 0).length} words`
                            }
                          </span>
                          <span>Auto-saved • Last updated: {new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
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
          
          {/* Quick Suggestion Section */}
          <div className="border-b border-border pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Quick Suggestion</h3>
              <div className="flex items-center gap-2">
                {/* Manual Trigger Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateQuickSuggestion}
                  disabled={isGeneratingSuggestion}
                  className="flex items-center gap-1 px-2 py-1 h-7"
                  title="Generate Quick Suggestion"
                  aria-label="Generate AI-powered quick suggestion for current call context"
                >
                  {isGeneratingSuggestion ? (
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Zap size={12} />
                  )}
                  <span className="text-xs">Generate</span>
                </Button>
                
                {/* Automatic Generation Info */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-7 w-7"
                  title="A quick suggestion will automatically appear here whenever the customer asks a question."
                  aria-label="Information about automatic suggestion generation"
                >
                  <Info size={12} className="text-muted-foreground" />
                </Button>
              </div>
            </div>
            
            {/* Single Quick Suggestion Display */}
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <div className="text-sm text-foreground leading-relaxed">
                {isGeneratingSuggestion ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Generating suggestion...</span>
                  </div>
                ) : (
                  quickSuggestion
                )}
              </div>
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
            <div className="flex-1 overflow-y-auto bg-muted/30 rounded-lg p-3 mb-3 min-h-0 scrollbar-thin">
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
        </Card>
      </div>

      {/* Create Ticket Modal */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Create Support Ticket</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeTicketModal}
                className="h-8 w-8 p-0"
                aria-label="Close create ticket modal"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customer-name" className="block text-sm font-medium text-foreground mb-1">
                      Customer Name *
                    </label>
                    <Input
                      id="customer-name"
                      type="text"
                      value={ticketForm.customerName}
                      onChange={(e) => handleTicketFormChange('customerName', e.target.value)}
                      placeholder="Enter customer's full name"
                      required
                      aria-describedby="customer-name-help"
                    />
                    <p id="customer-name-help" className="text-xs text-muted-foreground mt-1">
                      Required field
                    </p>
                  </div>
                  <div>
                    <label htmlFor="customer-email" className="block text-sm font-medium text-foreground mb-1">
                      Email Address
                    </label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={ticketForm.customerEmail}
                      onChange={(e) => handleTicketFormChange('customerEmail', e.target.value)}
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="customer-phone" className="block text-sm font-medium text-foreground mb-1">
                      Phone Number
                    </label>
                    <Input
                      id="customer-phone"
                      type="tel"
                      value={ticketForm.customerPhone}
                      onChange={(e) => handleTicketFormChange('customerPhone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label htmlFor="call-id" className="block text-sm font-medium text-foreground mb-1">
                      Call ID
                    </label>
                    <Input
                      id="call-id"
                      type="text"
                      value={ticketForm.callId}
                      onChange={(e) => handleTicketFormChange('callId', e.target.value)}
                      placeholder="Auto-generated from current call"
                      className="bg-muted"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Issue Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Issue Details</h3>
                <div>
                  <label htmlFor="issue-title" className="block text-sm font-medium text-foreground mb-1">
                    Issue Title *
                  </label>
                  <Input
                    id="issue-title"
                    type="text"
                    value={ticketForm.issueTitle}
                    onChange={(e) => handleTicketFormChange('issueTitle', e.target.value)}
                    placeholder="Brief summary of the customer's issue"
                    required
                    aria-describedby="issue-title-help"
                  />
                  <p id="issue-title-help" className="text-xs text-muted-foreground mt-1">
                    Required - Keep it concise and descriptive
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-1">
                      Priority *
                    </label>
                    <select
                      id="priority"
                      value={ticketForm.priority}
                      onChange={(e) => handleTicketFormChange('priority', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                      required
                    >
                      <option value="low">Low - General inquiry</option>
                      <option value="medium">Medium - Standard issue</option>
                      <option value="high">High - Urgent issue</option>
                      <option value="urgent">Urgent - Critical problem</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      value={ticketForm.category}
                      onChange={(e) => handleTicketFormChange('category', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                      required
                    >
                      <option value="general">General Support</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing & Payment</option>
                      <option value="account">Account Management</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="issue-description" className="block text-sm font-medium text-foreground mb-1">
                    Issue Description *
                  </label>
                  <textarea
                    id="issue-description"
                    value={ticketForm.issueDescription}
                    onChange={(e) => handleTicketFormChange('issueDescription', e.target.value)}
                    placeholder="Detailed description of the issue, including steps to reproduce, error messages, and any relevant context from the call..."
                    rows={4}
                    required
                    aria-describedby="issue-description-help"
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-vertical"
                  />
                  <p id="issue-description-help" className="text-xs text-muted-foreground mt-1">
                    Required - Provide as much detail as possible to help resolve the issue quickly
                  </p>
                </div>

                <div>
                  <label htmlFor="agent-notes" className="block text-sm font-medium text-foreground mb-1">
                    Agent Notes
                  </label>
                  <textarea
                    id="agent-notes"
                    value={ticketForm.agentNotes}
                    onChange={(e) => handleTicketFormChange('agentNotes', e.target.value)}
                    placeholder="Internal notes for other agents or follow-up actions..."
                    rows={3}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-vertical"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Internal notes - not visible to customer
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={closeTicketModal}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTicketSubmit}
                disabled={!ticketForm.customerName || !ticketForm.issueTitle || !ticketForm.issueDescription}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Create Ticket
              </Button>
            </div>
          </div>
        </div>
      )}

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
