/**
 * CreateTicketModal Component
 * 
 * Modal for creating support tickets from live call sessions.
 * Features comprehensive form validation and call context integration.
 */

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

interface CallSession {
  callId: string;
  tabId: string;
  tabLabel: string;
  participantInfo: { agent: string, customer: string, customerPhone?: string };
  callStatus: 'active' | 'ringing' | 'on-hold' | 'ended' | 'connecting';
  callStartTime: Date;
  isActive: boolean;
}

interface CreateTicketModalProps {
  show: boolean;
  onClose: () => void;
  callSession?: CallSession | null;
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

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  show,
  onClose,
  callSession
}) => {
  const [ticketForm, setTicketForm] = useState<TicketForm>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    callId: '',
    issueTitle: '',
    issueDescription: '',
    priority: 'medium',
    category: 'general',
    agentNotes: ''
  });

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
        priority: 'medium',
        category: 'general',
        agentNotes: ''
      });
    }
  }, [show]);

  if (!show) return null;

  const handleTicketFormChange = (field: keyof TicketForm, value: string) => {
    setTicketForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTicketSubmit = () => {
    // Validate required fields
    if (!ticketForm.customerName || !ticketForm.issueTitle || !ticketForm.issueDescription) {
      return;
    }

    // IMPLEMENT LATER: Submit ticket to backend
    console.log('Creating ticket:', ticketForm);
    
    // Close modal after successful submission
    onClose();
  };

  const closeTicketModal = () => {
    onClose();
  };

  return (
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
  );
};
