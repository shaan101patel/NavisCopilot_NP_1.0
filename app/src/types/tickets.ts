export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
}

export interface Agent {
  id: string
  full_name: string
  email: string
}

export interface Call {
  id: string
  call_sid: string
  created_at: string
  transcript?: string
  summary?: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  customer_id?: string
  caller_id?: string
  agent_id?: string
  call_id?: string
  category?: string
  tags?: string[]
  resolution_notes?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  closed_at?: string
  
  // Relations
  customer?: Customer
  agent?: Agent
  call?: Call
}

export interface TicketComment {
  id: string
  ticket_id: string
  user_id: string
  content: string
  is_internal: boolean
  created_at: string
  updated_at: string
  
  // Relations
  user?: Agent
}

export interface TicketAttachment {
  id: string
  ticket_id: string
  filename: string
  file_url: string
  file_size: number
  content_type: string
  uploaded_by: string
  created_at: string
  
  // Relations
  uploader?: Agent
}
