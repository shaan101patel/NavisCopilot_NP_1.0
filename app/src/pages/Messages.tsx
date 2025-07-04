import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Search, Send, Users, MessageSquare, Bell, Phone, Filter, MoreVertical } from "lucide-react";

// IMPLEMENT LATER: Replace with real user/agent data from backend
// Expected data structure:
// - users: Array<{
//     id: string,
//     name: string,
//     email: string,
//     role: 'agent' | 'manager' | 'admin',
//     department: string,
//     status: 'online' | 'offline' | 'busy' | 'away',
//     avatar?: string,
//     lastSeen?: Date
//   }>
// - Real-time status updates via WebSocket
const mockUsers = [
  { id: "user-1", name: "Sarah Wilson", role: "manager", department: "Customer Support", status: "online" },
  { id: "user-2", name: "Mike Chen", role: "agent", department: "Technical Support", status: "online" },
  { id: "user-3", name: "Emily Rodriguez", role: "agent", department: "Customer Support", status: "busy" },
  { id: "user-4", name: "David Kim", role: "admin", department: "Operations", status: "away" },
  { id: "user-5", name: "Lisa Thompson", role: "agent", department: "Billing", status: "offline" },
];

// IMPLEMENT LATER: Replace with real conversation/message data from backend
// Expected data structure:
// - conversations: Array<{
//     id: string,
//     participants: string[], // user IDs
//     type: 'direct' | 'group' | 'announcement',
//     title?: string, // for group conversations
//     lastMessage?: {
//       id: string,
//       senderId: string,
//       content: string,
//       timestamp: Date,
//       type: 'text' | 'file' | 'system'
//     },
//     unreadCount: number,
//     createdAt: Date,
//     updatedAt: Date
//   }>
// - messages: Array<{
//     id: string,
//     conversationId: string,
//     senderId: string,
//     content: string,
//     type: 'text' | 'file' | 'system' | 'call_invite',
//     timestamp: Date,
//     isRead: boolean,
//     editedAt?: Date,
//     replyToId?: string,
//     attachments?: Array<{ id: string, filename: string, url: string, type: string }>
//   }>
// - Real-time messaging via WebSocket events: 'message-sent', 'message-received', 'user-typing', 'message-read'
const mockConversations = [
  {
    id: "conv-1",
    participants: ["user-1", "current-user"],
    type: "direct",
    lastMessage: {
      id: "msg-1",
      senderId: "user-1",
      content: "Please review the latest customer feedback report",
      timestamp: new Date(Date.now() - 1800000)
    },
    unreadCount: 2,
    updatedAt: new Date(Date.now() - 1800000)
  },
  {
    id: "conv-2",
    participants: ["user-2", "current-user"],
    type: "direct",
    lastMessage: {
      id: "msg-2",
      senderId: "current-user",
      content: "Thanks for the help with the technical issue",
      timestamp: new Date(Date.now() - 3600000)
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 3600000)
  },
  {
    id: "conv-3",
    participants: ["user-1", "user-2", "user-3", "current-user"],
    type: "group",
    title: "Customer Support Team",
    lastMessage: {
      id: "msg-3",
      senderId: "user-3",
      content: "Team meeting at 3 PM today",
      timestamp: new Date(Date.now() - 7200000)
    },
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 7200000)
  },
];

const mockMessages = {
  "conv-1": [
    {
      id: "msg-1-1",
      senderId: "user-1",
      content: "Hi! I've uploaded the customer feedback report for this quarter.",
      timestamp: new Date(Date.now() - 7200000),
      type: "text"
    },
    {
      id: "msg-1-2",
      senderId: "user-1",
      content: "Please review the latest customer feedback report",
      timestamp: new Date(Date.now() - 1800000),
      type: "text"
    },
    {
      id: "msg-1-3",
      senderId: "user-1",
      content: "Let me know if you have any questions about the data.",
      timestamp: new Date(Date.now() - 1800000),
      type: "text"
    },
  ],
  "conv-2": [
    {
      id: "msg-2-1",
      senderId: "user-2",
      content: "Hey, need help with a technical issue. Customer's system won't connect.",
      timestamp: new Date(Date.now() - 7200000),
      type: "text"
    },
    {
      id: "msg-2-2",
      senderId: "current-user",
      content: "Sure! Can you share the error logs?",
      timestamp: new Date(Date.now() - 6900000),
      type: "text"
    },
    {
      id: "msg-2-3",
      senderId: "current-user",
      content: "Thanks for the help with the technical issue",
      timestamp: new Date(Date.now() - 3600000),
      type: "text"
    },
  ],
};

type FilterType = 'all' | 'unread' | 'direct' | 'group';

export default function Notifications() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>("conv-1");
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>('all');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation]);

  // IMPLEMENT LATER: Connect to backend messaging system
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // IMPLEMENT LATER: Send message to backend
    // Expected API call:
    // - Endpoint: POST /api/messages
    // - Payload: { 
    //     conversationId: string, 
    //     content: string, 
    //     type: 'text' | 'file',
    //     replyToId?: string,
    //     attachments?: FileUpload[]
    //   }
    // - Response: { messageId: string, timestamp: Date, status: 'sent' | 'delivered' | 'read' }
    // - WebSocket broadcast to conversation participants
    // - Update conversation lastMessage and timestamp
    // - Handle message encryption for sensitive conversations
    console.log(`Sending message: ${newMessage} to conversation: ${selectedConversation}`);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Filter conversations based on search and filter type
  const filteredConversations = mockConversations.filter(conv => {
    if (searchQuery) {
      const participantNames = conv.participants
        .map(id => mockUsers.find(u => u.id === id)?.name || '')
        .join(' ');
      const title = conv.title || '';
      const searchText = (participantNames + ' ' + title + ' ' + (conv.lastMessage?.content || '')).toLowerCase();
      if (!searchText.includes(searchQuery.toLowerCase())) return false;
    }

    switch (filter) {
      case 'unread':
        return conv.unreadCount > 0;
      case 'direct':
        return conv.type === 'direct';
      case 'group':
        return conv.type === 'group';
      default:
        return true;
    }
  });

  const getConversationTitle = (conversation: any) => {
    if (conversation.title) return conversation.title;
    const otherParticipants = conversation.participants.filter((id: string) => id !== 'current-user');
    return otherParticipants
      .map((id: string) => mockUsers.find(u => u.id === id)?.name || 'Unknown')
      .join(', ');
  };

  const getParticipantStatus = (userId: string) => {
    return mockUsers.find(u => u.id === userId)?.status || 'offline';
  };

  const selectedConversationData = mockConversations.find(c => c.id === selectedConversation);
  const currentMessages = selectedConversation ? mockMessages[selectedConversation as keyof typeof mockMessages] || [] : [];

  return (
    <div className="h-[calc(100vh-200px)] flex gap-6">
      {/* Conversations Sidebar */}
      <div className="w-80 flex flex-col">
        <div className="mb-4">
          <h1 className="text-3xl font-heading mb-4">Messages</h1>
          
          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="flex gap-2">
              {(['all', 'unread', 'direct', 'group'] as FilterType[]).map((filterType) => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(filterType)}
                  className="capitalize"
                >
                  {filterType}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <Card className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {/* IMPLEMENT LATER: Load conversations from backend with pagination */}
            {/* Expected API: GET /api/conversations?limit=50&offset=0&filter={filter}&search={query} */}
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedConversation === conversation.id ? 'bg-accent border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm text-foreground">
                        {getConversationTitle(conversation)}
                      </div>
                      {conversation.type === 'group' && (
                        <Users size={12} className="text-muted-foreground" />
                      )}
                      {conversation.unreadCount > 0 && (
                        <div className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {conversation.lastMessage?.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationData ? (
          <>
            {/* Chat Header */}
            <Card className="p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-semibold text-foreground">
                      {getConversationTitle(selectedConversationData)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedConversationData.type === 'direct' ? (
                        <>
                          {selectedConversationData.participants
                            .filter(id => id !== 'current-user')
                            .map(id => {
                              const status = getParticipantStatus(id);
                              return (
                                <span key={id} className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${
                                    status === 'online' ? 'bg-green-500' :
                                    status === 'busy' ? 'bg-red-500' :
                                    status === 'away' ? 'bg-yellow-500' :
                                    'bg-gray-500'
                                  }`}></div>
                                  {status}
                                </span>
                              );
                            })}
                        </>
                      ) : (
                        `${selectedConversationData.participants.length} participants`
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* IMPLEMENT LATER: Add call functionality for direct conversations */}
                  {selectedConversationData.type === 'direct' && (
                    <Button variant="ghost" size="sm">
                      <Phone size={16} />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreVertical size={16} />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Messages */}
            <Card className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* IMPLEMENT LATER: Load message history from backend */}
                {/* Expected API: GET /api/conversations/{id}/messages?limit=100&before={messageId} */}
                {/* WebSocket events: 'message-received', 'user-typing', 'message-read', 'message-edited' */}
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      message.senderId === 'current-user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-muted text-foreground'
                    }`}>
                      {message.senderId !== 'current-user' && selectedConversationData.type === 'group' && (
                        <div className="text-xs font-medium mb-1 text-muted-foreground">
                          {mockUsers.find(u => u.id === message.senderId)?.name || 'Unknown'}
                        </div>
                      )}
                      <div className="break-words">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.senderId === 'current-user' ? 'text-blue-100' : 'text-muted-foreground'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">Someone is typing</span>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare size={48} className="mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2 text-foreground">Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
