/**
 * TicketDetailsView Component
 * 
 * A comprehensive modal view for displaying detailed ticket information including:
 * - Ticket metadata and status
 * - Customer information
 * - Associated call details and transcript
 * - Agent notes and AI insights
 * - Action history and resolution details
 * 
 * Designed for clarity, accessibility, and real backend integration.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket } from '@/services/tickets';
import { callAPI } from '@/services/supabase';
import {
  X,
  User,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit3,
  MessageSquare,
  FileText,
  Tag,
  ArrowRight
} from 'lucide-react';

/**
 * TicketDetailsView Component
 * 
 * A comprehensive modal view for displaying detailed ticket information including:
 * - Ticket metadata and status
 * - Customer information
 * - Associated call details and transcript
 * - Agent notes and AI insights
 * - Action history and resolution details
 * 
 * Designed for clarity, accessibility, and real backend integration.
 */

interface TicketDetailsViewProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
}

const statusColors = {
  "open": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  "in-progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  "resolved": "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  "closed": "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
  "escalated": "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
};

const priorityColors = {
  "low": "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
  "medium": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  "high": "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  "urgent": "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
};

const statusIcons = {
  "open": AlertCircle,
  "in-progress": Clock,
  "resolved": CheckCircle,
  "closed": CheckCircle,
  "escalated": AlertCircle
};

export const TicketDetailsView: React.FC<TicketDetailsViewProps> = ({
  ticket,
  isOpen,
  onClose
}) => {
  // State for related data
  const [callTranscript, setCallTranscript] = useState<any[]>([]);
  const [callDetails, setCallDetails] = useState<any>(null);
  const [aiChatMessages, setAiChatMessages] = useState<any[]>([]);
  const [callNotes, setCallNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load related data when ticket changes
  useEffect(() => {
    if (ticket.call_id) {
      loadCallData();
    }
  }, [ticket.call_id]);

  const loadCallData = async () => {
    if (!ticket.call_id) return;

    setLoading(true);
    setError(null);

    try {
      // Load call details, transcript, AI chat, and notes in parallel
      const [callDetailsRes, transcriptRes, aiChatRes, notesRes] = await Promise.allSettled([
        callAPI.getCallSession(ticket.call_id),
        callAPI.getCallTranscript(ticket.call_id),
        callAPI.getCallAiChatMessages(ticket.call_id),
        callAPI.getCallNotes(ticket.call_id)
      ]);

      if (callDetailsRes.status === 'fulfilled') {
        setCallDetails(callDetailsRes.value);
      } else {
        console.warn('Failed to load call details:', callDetailsRes.reason);
      }

      if (transcriptRes.status === 'fulfilled') {
        setCallTranscript(transcriptRes.value.transcript || []);
      } else {
        console.warn('Failed to load call transcript:', transcriptRes.reason);
      }

      if (aiChatRes.status === 'fulfilled') {
        setAiChatMessages(aiChatRes.value.messages || []);
      } else {
        console.warn('Failed to load AI chat messages:', aiChatRes.reason);
      }

      if (notesRes.status === 'fulfilled') {
        setCallNotes(notesRes.value.notes || []);
      } else {
        console.warn('Failed to load call notes:', notesRes.reason);
      }
    } catch (err: any) {
      console.error('Error loading call data:', err);
      setError('Failed to load call data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const StatusIcon = statusIcons[ticket.status];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <CardHeader className="border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold">{ticket.title}</h2>
                <Badge className={`${statusColors[ticket.status]} flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {ticket.status}
                </Badge>
                <Badge className={priorityColors[ticket.priority]}>
                  {ticket.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Ticket #{ticket.ticket_number} • Created {new Date(ticket.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ticket Details */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Ticket Details
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="mt-1 text-sm">{ticket.description}</p>
                  </div>
                  
                  {ticket.issue_category && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Category</label>
                      <p className="mt-1 text-sm">{ticket.issue_category}</p>
                    </div>
                  )}

                  {ticket.tags && ticket.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tags</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ticket.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{new Date(ticket.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{new Date(ticket.updated_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {ticket.resolved_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Resolved</label>
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{new Date(ticket.resolved_at).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ticket.customer_name && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="mt-1 text-sm font-medium">{ticket.customer_name}</p>
                    </div>
                  )}

                  {ticket.customer_email && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${ticket.customer_email}`} className="text-sm text-blue-600 hover:underline">
                          {ticket.customer_email}
                        </a>
                      </div>
                    </div>
                  )}

                  {ticket.customer_phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${ticket.customer_phone}`} className="text-sm text-blue-600 hover:underline">
                          {ticket.customer_phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {ticket.call_id && (
                    <div className="pt-2 border-t">
                      <label className="text-sm font-medium text-muted-foreground">Associated Call</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-600">Call ID: {ticket.call_id}</span>
                        {ticket.created_from_call && (
                          <Badge variant="secondary" className="text-xs">Created from call</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Agent Notes and Resolution */}
            {(ticket.agent_notes || ticket.resolution_summary) && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Agent Notes & Resolution
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ticket.agent_notes && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Agent Notes</label>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{ticket.agent_notes}</p>
                    </div>
                  )}

                  {ticket.resolution_summary && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Resolution Summary</label>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{ticket.resolution_summary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI Insights */}
            {ticket.ai_insights && ticket.ai_insights.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    AI Insights
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {ticket.ai_insights.map((insight, index) => (
                      <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Call-Related Data */}
            {ticket.call_id && (
              <div className="space-y-6">
                {/* Call Details */}
                {callDetails && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Call Details
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <p className="mt-1 text-sm font-medium capitalize">{callDetails.status}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Started</label>
                          <p className="mt-1 text-sm">{new Date(callDetails.startTime).toLocaleString()}</p>
                        </div>
                        {callDetails.endTime && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Ended</label>
                            <p className="mt-1 text-sm">{new Date(callDetails.endTime).toLocaleString()}</p>
                          </div>
                        )}
                        {callDetails.customerInfo && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Customer</label>
                            <p className="mt-1 text-sm">{callDetails.customerInfo.name}</p>
                            {callDetails.customerInfo.phone && (
                              <p className="text-xs text-muted-foreground">{callDetails.customerInfo.phone}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Loading State */}
                {loading && (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-muted-foreground">Loading call data...</span>
                    </CardContent>
                  </Card>
                )}

                {/* Call Transcript */}
                {callTranscript.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Call Transcript
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {callTranscript.map((segment, index) => (
                          <div key={index} className={`p-3 rounded-lg ${
                            segment.speaker === 'agent' 
                              ? 'bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500' 
                              : 'bg-gray-50 dark:bg-gray-950/30 border-l-4 border-gray-500'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium capitalize">
                                {segment.speaker === 'agent' ? 'Agent' : 'Customer'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(segment.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{segment.text}</p>
                            {segment.sentiment && (
                              <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
                                segment.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                                segment.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {segment.sentiment}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Chat Messages */}
                {aiChatMessages.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        AI Chat History
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {aiChatMessages.map((message, index) => (
                          <div key={index} className={`p-3 rounded-lg ${
                            message.sender === 'agent' 
                              ? 'bg-blue-50 dark:bg-blue-950/30' 
                              : 'bg-green-50 dark:bg-green-950/30'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                {message.sender === 'agent' ? 'Agent' : 'AI Assistant'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                            {message.confidence && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                Confidence: {Math.round(message.confidence * 100)}%
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Call Notes */}
                {callNotes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Call Notes
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {callNotes.map((note, index) => (
                          <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm">{note.content}</p>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Created: {new Date(note.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="flex justify-end">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
