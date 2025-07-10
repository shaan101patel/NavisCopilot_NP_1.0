/**
 * TicketDetailsView Component
 * 
 * Comprehensive ticket details view showing all ticket information,
 * associated call data, transcript, notes, and AI chat history.
 * Designed for clarity, accessibility, and future backend integration.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  X, 
  Copy, 
  Check, 
  Phone, 
  User, 
  Mail, 
  Calendar,
  MessageSquare,
  FileText,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle,
  Pause
} from "lucide-react";
import clsx from "clsx";

// IMPLEMENT LATER: Replace with real ticket data types from backend
interface TicketDetails {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  callId?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  agentNotes: string;
  createdAt: Date;
  updatedAt: Date;
  assignedAgent?: string;
}

interface TranscriptLine {
  id: string;
  speaker: 'Agent' | 'Customer';
  text: string;
  timestamp: Date;
}

interface StickyNote {
  id: string;
  content: string;
  color: string;
  createdAt: Date;
}

interface ChatMessage {
  id: string;
  sender: 'agent' | 'ai';
  content: string;
  timestamp: Date;
  aiResponseLevel?: 'instant' | 'quick' | 'immediate';
}

interface TicketDetailsViewProps {
  ticket: TicketDetails;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketDetailsView: React.FC<TicketDetailsViewProps> = ({
  ticket,
  isOpen,
  onClose
}) => {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [isEditingCallSummary, setIsEditingCallSummary] = useState(false);
  const [callSummary, setCallSummary] = useState('');

  // IMPLEMENT LATER: Fetch call transcript from backend
  // Expected API: GET /api/calls/{callId}/transcript
  // Data structure: { transcript: TranscriptLine[], callDuration: number, callStartTime: Date }
  const mockTranscript: TranscriptLine[] = [
    { id: 't1', speaker: 'Agent', text: 'Hello, thank you for calling Navis support. How can I help you today?', timestamp: new Date() },
    { id: 't2', speaker: 'Customer', text: 'Hi, I\'m having trouble with my recent order. It hasn\'t arrived yet.', timestamp: new Date() },
    { id: 't3', speaker: 'Agent', text: 'I\'d be happy to help you track your order. Can you provide me with your order number?', timestamp: new Date() },
    { id: 't4', speaker: 'Customer', text: 'Yes, it\'s ORD-12345.', timestamp: new Date() },
  ];

  // IMPLEMENT LATER: Fetch sticky notes from backend
  // Expected API: GET /api/calls/{callId}/notes
  // Data structure: { notes: StickyNote[] }
  const mockStickyNotes: StickyNote[] = [
    { id: 'n1', content: 'Customer mentioned previous shipping issues', color: 'yellow', createdAt: new Date() },
    { id: 'n2', content: 'Check order status in fulfillment system', color: 'blue', createdAt: new Date() },
    { id: 'n3', content: 'Follow up needed within 24 hours', color: 'pink', createdAt: new Date() },
  ];

  // IMPLEMENT LATER: Fetch AI chat history from backend
  // Expected API: GET /api/calls/{callId}/chat-history
  // Data structure: { chatHistory: ChatMessage[] }
  const mockChatHistory: ChatMessage[] = [
    { id: 'c1', sender: 'agent', content: 'How should I handle a delayed order complaint?', timestamp: new Date() },
    { id: 'c2', sender: 'ai', content: 'Start by apologizing for the inconvenience, then check the order status in your system. Offer tracking information and provide an estimated delivery date.', timestamp: new Date(), aiResponseLevel: 'quick' },
    { id: 'c3', sender: 'agent', content: 'What if the order is lost?', timestamp: new Date() },
    { id: 'c4', sender: 'ai', content: 'If the order appears lost, offer a full refund or replacement shipment. Document the incident and escalate to fulfillment team for investigation.', timestamp: new Date(), aiResponseLevel: 'immediate' },
  ];

  if (!isOpen) return null;

  const handleCopyText = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(itemId));
      setTimeout(() => {
        setCopiedItems(prev => {
          const updated = new Set(prev);
          updated.delete(itemId);
          return updated;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleCopyAllTranscript = async () => {
    const fullTranscript = mockTranscript
      .map(line => `${line.speaker}: ${line.text}`)
      .join('\n');
    await handleCopyText(fullTranscript, 'full-transcript');
  };

  const handleGenerateAiSummary = () => {
    // IMPLEMENT LATER: Call AI service to generate call summary
    // Expected API: POST /api/ai/generate-summary
    // Payload: { callId: string, transcriptData: TranscriptLine[] }
    setCallSummary('AI-generated summary will be implemented with backend integration. This would contain a comprehensive overview of the call, key points discussed, resolution provided, and follow-up actions needed.');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle size={16} className="text-red-500" />;
      case 'pending': return <Pause size={16} className="text-yellow-500" />;
      case 'resolved': return <CheckCircle size={16} className="text-green-500" />;
      case 'closed': return <CheckCircle size={16} className="text-gray-500" />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getStickyNoteColor = (color: string) => {
    switch (color) {
      case 'yellow': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'blue': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'pink': return 'bg-pink-100 border-pink-300 text-pink-800';
      case 'green': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Ticket Details</h2>
              <p className="text-sm text-muted-foreground">#{ticket.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={clsx("text-white", getPriorityColor(ticket.priority))}>
                {ticket.priority.toUpperCase()}
              </Badge>
              <div className="flex items-center gap-1">
                {getStatusIcon(ticket.status)}
                <span className="text-sm font-medium capitalize">{ticket.status}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            aria-label="Close ticket details"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)] overflow-hidden">
          {/* Left Panel - Ticket Info & Call Data */}
          <div className="w-1/2 p-6 overflow-y-auto border-r border-border">
            
            {/* 1. Ticket Information Panel */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={18} />
                  Ticket Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                    <p className="text-sm font-medium">{ticket.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{ticket.customerEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm">{ticket.customerPhone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Call ID</label>
                    <p className="text-sm font-mono">{ticket.callId || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Issue Title</label>
                  <p className="text-sm font-medium">{ticket.title}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm leading-relaxed">{ticket.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="text-sm">{ticket.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assigned Agent</label>
                    <p className="text-sm">{ticket.assignedAgent || 'Unassigned'}</p>
                  </div>
                </div>
                
                {ticket.agentNotes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Agent Notes</label>
                    <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md">{ticket.agentNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Call Transcript Section */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare size={18} />
                    Call Transcript
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAllTranscript}
                    className="flex items-center gap-2"
                  >
                    {copiedItems.has('full-transcript') ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                    Copy All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {mockTranscript.map((line) => (
                    <div key={line.id} className="flex items-start gap-3 p-3 rounded-md bg-muted/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={clsx(
                            "text-xs font-medium px-2 py-1 rounded",
                            line.speaker === 'Agent' 
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          )}>
                            {line.speaker}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {line.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{line.text}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyText(line.text, line.id)}
                        className="h-8 w-8 p-0 opacity-70 hover:opacity-100"
                        title="Copy this line"
                      >
                        {copiedItems.has(line.id) ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 3. Call Sticky Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={18} />
                  Call Notes
                </CardTitle>
                <CardDescription>
                  Sticky notes created during the call
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {mockStickyNotes.map((note) => (
                    <div
                      key={note.id}
                      className={clsx(
                        "p-3 rounded-md border-l-4 relative group",
                        getStickyNoteColor(note.color)
                      )}
                    >
                      <p className="text-sm leading-relaxed pr-8">{note.content}</p>
                      <div className="text-xs opacity-70 mt-2">
                        {note.createdAt.toLocaleTimeString()}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyText(note.content, note.id)}
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy note"
                      >
                        {copiedItems.has(note.id) ? (
                          <Check size={12} className="text-green-600" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Call Summary & AI Chat */}
          <div className="w-1/2 p-6 overflow-y-auto">
            
            {/* 4. Call Summary (Document-Style Space) */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={18} />
                    Call Summary
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {!isEditingCallSummary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateAiSummary}
                        className="flex items-center gap-2"
                      >
                        <Zap size={14} />
                        Generate AI Summary
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingCallSummary(!isEditingCallSummary)}
                    >
                      {isEditingCallSummary ? 'Save' : 'Edit'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditingCallSummary ? (
                  <textarea
                    value={callSummary}
                    onChange={(e) => setCallSummary(e.target.value)}
                    placeholder="Enter call summary or use AI generation..."
                    rows={8}
                    className="w-full p-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-vertical"
                  />
                ) : (
                  <div className="min-h-32 p-3 bg-muted/30 rounded-md">
                    {callSummary ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{callSummary}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No summary available. Click "Edit" to add notes or "Generate AI Summary" for automatic generation.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 5. AI Chat History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare size={18} />
                  AI Chat History
                </CardTitle>
                <CardDescription>
                  Agent-AI conversation during this call
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {mockChatHistory.map((message) => (
                    <div
                      key={message.id}
                      className={clsx(
                        "p-3 rounded-md relative group",
                        message.sender === 'agent'
                          ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                          : "bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={clsx(
                          "text-xs font-medium px-2 py-1 rounded",
                          message.sender === 'agent'
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200"
                        )}>
                          {message.sender === 'agent' ? 'Agent' : 'AI Assistant'}
                        </span>
                        {message.aiResponseLevel && (
                          <Badge variant="default" className="text-xs border border-gray-300">
                            {message.aiResponseLevel}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed pr-8">{message.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyText(message.content, message.id)}
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy message"
                      >
                        {copiedItems.has(message.id) ? (
                          <Check size={12} className="text-green-500" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
