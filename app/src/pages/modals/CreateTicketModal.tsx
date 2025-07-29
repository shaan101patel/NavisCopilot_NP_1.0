/**
 * CreateTicketModal Component
 * 
 * Enhanced modal for creating support tickets from live call sessions.
 * Features comprehensive form validation, call context integration,
 * live transcript, call notes, AI chat log, and analytics inclusion.
 */

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, FileText, MessageSquare, Brain, BarChart3, CheckCircle2 } from "lucide-react";
import { ticketAPI } from '@/services/tickets';
import { 
  CallSession, 
  TranscriptEntry, 
  StickyNote, 
  ChatMessage 
} from '@/types/livecall';

interface CallAnalytics {
  callDuration: number;
  sentimentScore?: number;
  keywordsMentioned: string[];
  escalationFlags: string[];
  resolutionStatus?: 'resolved' | 'pending' | 'escalated';
}

interface CreateTicketModalProps {
  show: boolean;
  onClose: () => void;
  callSession?: CallSession | null;
  transcript?: TranscriptEntry[];
  stickyNotes?: StickyNote[];
  documentNotes?: string;
  aiChatMessages?: ChatMessage[];
  callAnalytics?: CallAnalytics;
}

interface TicketForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  callId: string;
  issueTitle: string;
  issueDescription: string;
  priority: string;
  category: string;
  agentNotes: string;
}

interface CallDataOptions {
  includeTranscript: boolean;
  includeNotes: boolean;
  includeAiChat: boolean;
  includeAnalytics: boolean;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  show,
  onClose,
  callSession,
  transcript = [],
  stickyNotes = [],
  documentNotes = '',
  aiChatMessages = [],
  callAnalytics
}) => {
  const [ticketForm, setTicketForm] = useState<TicketForm>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    callId: '',
    issueTitle: '',
    issueDescription: '',
    priority: '',
    category: '',
    agentNotes: ''
  });

  const [callDataOptions, setCallDataOptions] = useState<CallDataOptions>({
    includeTranscript: true,
    includeNotes: true,
    includeAiChat: true,
    includeAnalytics: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Populate form with call session data when modal opens
  useEffect(() => {
    if (show && callSession) {
      setTicketForm(prev => ({
        ...prev,
        customerName: callSession.participantInfo.customer || '',
        customerPhone: callSession.participantInfo.customerPhone || '',
        callId: callSession.callId || ''
      }));
    }
  }, [show, callSession]);

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setTicketForm({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        callId: '',
        issueTitle: '',
        issueDescription: '',
        priority: '',
        category: '',
        agentNotes: ''
      });
      setCallDataOptions({
        includeTranscript: true,
        includeNotes: true,
        includeAiChat: true,
        includeAnalytics: true
      });
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [show]);

  if (!show) return null;

  const handleTicketFormChange = (field: keyof TicketForm, value: string) => {
    setTicketForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCallDataOptionChange = (option: keyof CallDataOptions, value: boolean) => {
    setCallDataOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const generateComprehensiveDescription = (): string => {
    let description = ticketForm.issueDescription;
    
    // Add call context
    if (callSession) {
      description += `\n\n--- CALL CONTEXT ---\n`;
      description += `Call ID: ${callSession.callId}\n`;
      description += `Customer: ${callSession.participantInfo.customer}\n`;
      description += `Agent: ${callSession.participantInfo.agent}\n`;
      description += `Call Start Time: ${callSession.callStartTime.toLocaleString()}\n`;
      description += `Call Status: ${callSession.callStatus}\n`;
    }

    // Add analytics if included
    if (callDataOptions.includeAnalytics && callAnalytics) {
      description += `\n\n--- CALL ANALYTICS ---\n`;
      description += `Duration: ${Math.round(callAnalytics.callDuration / 60000)} minutes\n`;
      if (callAnalytics.sentimentScore !== undefined) {
        description += `Sentiment Score: ${callAnalytics.sentimentScore.toFixed(2)}\n`;
      }
      if (callAnalytics.keywordsMentioned.length > 0) {
        description += `Keywords Mentioned: ${callAnalytics.keywordsMentioned.join(', ')}\n`;
      }
      if (callAnalytics.escalationFlags.length > 0) {
        description += `Escalation Flags: ${callAnalytics.escalationFlags.join(', ')}\n`;
      }
      if (callAnalytics.resolutionStatus) {
        description += `Resolution Status: ${callAnalytics.resolutionStatus}\n`;
      }
    }

    // Add transcript if included
    if (callDataOptions.includeTranscript && transcript.length > 0) {
      description += `\n\n--- CALL TRANSCRIPT ---\n`;
      transcript.forEach(entry => {
        description += `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker}: ${entry.text}\n`;
      });
    }

    // Add notes if included
    if (callDataOptions.includeNotes) {
      if (stickyNotes.length > 0) {
        description += `\n\n--- CALL NOTES (STICKY) ---\n`;
        stickyNotes.forEach(note => {
          description += `[${note.createdAt.toLocaleTimeString()}]: ${note.content}\n`;
        });
      }
      
      if (documentNotes.trim()) {
        description += `\n\n--- CALL NOTES (DOCUMENT) ---\n`;
        description += documentNotes;
      }
    }

    // Add AI chat if included
    if (callDataOptions.includeAiChat && aiChatMessages.length > 0) {
      description += `\n\n--- AI CHAT LOG ---\n`;
      aiChatMessages.forEach(message => {
        description += `[${message.timestamp.toLocaleTimeString()}] ${message.sender.toUpperCase()}: ${message.content}\n`;
      });
    }

    return description;
  };

  const handleTicketSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate required fields
      if (!ticketForm.issueTitle.trim()) {
        throw new Error('Issue title is required');
      }
      if (!ticketForm.issueDescription.trim()) {
        throw new Error('Issue description is required');
      }
      if (!ticketForm.priority) {
        throw new Error('Priority is required');
      }
      if (!ticketForm.category) {
        throw new Error('Category is required');
      }

      // Generate comprehensive description including selected call data
      const comprehensiveDescription = generateComprehensiveDescription();

      // Create ticket using the API
      const ticketData = {
        title: ticketForm.issueTitle,
        description: comprehensiveDescription,
        priority: ticketForm.priority as 'low' | 'medium' | 'high' | 'urgent',
        customer_name: ticketForm.customerName || undefined,
        customer_email: ticketForm.customerEmail || undefined,
        customer_phone: ticketForm.customerPhone || undefined,
        call_id: ticketForm.callId || undefined,
        created_from_call: true,
        agent_notes: ticketForm.agentNotes || undefined,
        issue_category: ticketForm.category || undefined,
        tags: [
          ...(callDataOptions.includeTranscript ? ['has-transcript'] : []),
          ...(callDataOptions.includeNotes ? ['has-notes'] : []),
          ...(callDataOptions.includeAiChat ? ['has-ai-chat'] : []),
          ...(callDataOptions.includeAnalytics ? ['has-analytics'] : []),
          'live-call-created'
        ]
      };

      const createdTicket = await ticketAPI.createTicket(ticketData);
      
      console.log('✅ Ticket created successfully:', createdTicket.id);
      
      // Close modal after successful submission
      onClose();
    } catch (error: any) {
      console.error('❌ Failed to create ticket:', error);
      setSubmitError(error.message || 'Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeTicketModal = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Create Support Ticket</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeTicketModal}
            className="h-8 w-8 p-0"
            aria-label="Close create ticket modal"
            disabled={isSubmitting}
          >
            <X size={16} />
          </Button>
        </div>

        {/* Error Display */}
        {submitError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{submitError}</p>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customer-name" className="block text-sm font-medium text-foreground mb-1">
                  Customer Name
                </label>
                <Input
                  id="customer-name"
                  type="text"
                  value={ticketForm.customerName}
                  onChange={(e) => handleTicketFormChange('customerName', e.target.value)}
                  placeholder="Enter customer's full name"
                  disabled={isSubmitting}
                />
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                Issue Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="issue-title"
                type="text"
                value={ticketForm.issueTitle}
                onChange={(e) => handleTicketFormChange('issueTitle', e.target.value)}
                placeholder="Brief summary of the customer's issue"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-1">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  id="priority"
                  value={ticketForm.priority}
                  onChange={(e) => handleTicketFormChange('priority', e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-50"
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Select priority level</option>
                  <option value="low">Low - General inquiry</option>
                  <option value="medium">Medium - Standard issue</option>
                  <option value="high">High - Urgent issue</option>
                  <option value="urgent">Urgent - Critical problem</option>
                </select>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={ticketForm.category}
                  onChange={(e) => handleTicketFormChange('category', e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-50"
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Select category</option>
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
                Issue Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="issue-description"
                value={ticketForm.issueDescription}
                onChange={(e) => handleTicketFormChange('issueDescription', e.target.value)}
                placeholder="Detailed description of the issue, including steps to reproduce, error messages, and any relevant context from the call..."
                rows={4}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-vertical disabled:opacity-50"
                disabled={isSubmitting}
                required
              />
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
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-vertical disabled:opacity-50"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Internal notes - not visible to customer
              </p>
            </div>
          </div>

          {/* Call Data Inclusion Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Include Call Data</h3>
            <p className="text-sm text-muted-foreground">
              Select which call data to include in the ticket for comprehensive context and follow-up.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-3 border border-border rounded-md">
                <input
                  type="checkbox"
                  id="include-transcript"
                  checked={callDataOptions.includeTranscript}
                  onChange={(e) => handleCallDataOptionChange('includeTranscript', e.target.checked)}
                  className="mt-1"
                  disabled={isSubmitting}
                />
                <div className="flex-1">
                  <label htmlFor="include-transcript" className="flex items-center space-x-2 cursor-pointer">
                    <FileText size={16} className="text-blue-500" />
                    <span className="font-medium">Live Transcript</span>
                    {callDataOptions.includeTranscript && <CheckCircle2 size={14} className="text-green-500" />}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Full conversation transcript ({transcript.length} entries)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border border-border rounded-md">
                <input
                  type="checkbox"
                  id="include-notes"
                  checked={callDataOptions.includeNotes}
                  onChange={(e) => handleCallDataOptionChange('includeNotes', e.target.checked)}
                  className="mt-1"
                  disabled={isSubmitting}
                />
                <div className="flex-1">
                  <label htmlFor="include-notes" className="flex items-center space-x-2 cursor-pointer">
                    <MessageSquare size={16} className="text-green-500" />
                    <span className="font-medium">Call Notes</span>
                    {callDataOptions.includeNotes && <CheckCircle2 size={14} className="text-green-500" />}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sticky notes ({stickyNotes.length}) and document notes
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border border-border rounded-md">
                <input
                  type="checkbox"
                  id="include-ai-chat"
                  checked={callDataOptions.includeAiChat}
                  onChange={(e) => handleCallDataOptionChange('includeAiChat', e.target.checked)}
                  className="mt-1"
                  disabled={isSubmitting}
                />
                <div className="flex-1">
                  <label htmlFor="include-ai-chat" className="flex items-center space-x-2 cursor-pointer">
                    <Brain size={16} className="text-purple-500" />
                    <span className="font-medium">AI Chat Log</span>
                    {callDataOptions.includeAiChat && <CheckCircle2 size={14} className="text-green-500" />}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    AI assistant conversations ({aiChatMessages.length} messages)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border border-border rounded-md">
                <input
                  type="checkbox"
                  id="include-analytics"
                  checked={callDataOptions.includeAnalytics}
                  onChange={(e) => handleCallDataOptionChange('includeAnalytics', e.target.checked)}
                  className="mt-1"
                  disabled={isSubmitting}
                />
                <div className="flex-1">
                  <label htmlFor="include-analytics" className="flex items-center space-x-2 cursor-pointer">
                    <BarChart3 size={16} className="text-orange-500" />
                    <span className="font-medium">Call Analytics</span>
                    {callDataOptions.includeAnalytics && <CheckCircle2 size={14} className="text-green-500" />}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Duration, sentiment, keywords, and flags
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={closeTicketModal}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTicketSubmit}
            className="flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} />
                Create Ticket
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
