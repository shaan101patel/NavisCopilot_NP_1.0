import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Upload, 
  FileText, 
  Image, 
  FileVideo, 
  File, 
  Search, 
  Filter,
  Download,
  Calendar,
  User,
  Paperclip,
  Grid3X3,
  List,
  Ticket,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Loader2,
  Trash2
} from "lucide-react";
import { DocumentSearch } from "../components/search/DocumentSearch";
import { toast } from "sonner";

// Helper function to format date
const formatDate = (dateInput: string | Date) => {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

// Helper function to get access token from localStorage
const getAccessToken = () => {
  try {
    const storedTokens = localStorage.getItem('navis-auth-tokens');
    if (storedTokens) {
      const tokens = JSON.parse(storedTokens);
      return tokens.access_token;
    }
  } catch (error) {
    console.error('Error getting access token:', error);
  }
  return null;
};

// Document interfaces for type safety
interface Document {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  url: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadDate: string | Date;
  lastModified: string | Date;
  category?: string;
  tags?: string[];
  description?: string;
  isPublic: boolean;
  downloadCount: number;
  viewCount?: number;
  ticketId?: string;
  callId?: string;
  customerId?: string;
  knowledgeBaseId?: string;
  metadata?: any;
  processing?: {
    status: string;
    progress: number;
    jobType: string;
  };
  relatedDocuments?: Document[];
}

interface UploadResult {
  success: boolean;
  document?: Document;
  error?: string;
}

interface DocumentListResponse {
  success: boolean;
  documents: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    category?: string;
    search?: string;
    fileType?: string;
    ticketId?: string;
    callId?: string;
    sort: string;
    order: string;
  };
}

// IMPLEMENT LATER: Expected data structure for ticket documents
// TicketDocument interface:
// interface TicketDocument {
//   id: string;
//   ticketId: string;
//   ticketTitle: string;
//   ticketStatus: 'active' | 'pending' | 'resolved' | 'closed';
//   customer: string;
//   customerPhone?: string;
//   customerEmail?: string;
//   priority: 'low' | 'medium' | 'high' | 'urgent';
//   category: string;
//   createdAt: Date;
//   updatedAt: Date;
//   assignedAgentId: string;
//   assignedAgentName: string;
//   documents: Document[];
//   callTranscripts?: string[];
//   notes?: string;
//   resolutionSummary?: string;
// }

// IMPLEMENT LATER: Backend integration points
// 1. Document upload to Supabase Storage:
//    - POST /api/documents/upload (multipart/form-data)
//    - Store file metadata in documents table
//    - Generate thumbnail for supported file types
//    - Validate file type and size limits
//    - Check user permissions for upload
//
// 2. Document retrieval:
//    - GET /api/documents (with pagination, filtering, search)
//    - GET /api/documents/:id (single document details)
//    - GET /api/documents/search?q=query (full-text search)
//
// 3. Document viewing/downloading:
//    - GET /api/documents/:id/view (stream file or redirect to signed URL)
//    - GET /api/documents/:id/download (force download)
//    - Track download analytics
//
// 4. Document management:
//    - PUT /api/documents/:id (update metadata)
//    - DELETE /api/documents/:id (delete document)
//    - POST /api/documents/:id/share (generate shareable link)
//
// 5. Ticket document integration:
//    - GET /api/tickets/:id/documents (get all documents for a ticket)
//    - POST /api/tickets/:id/documents (attach document to ticket)
//    - GET /api/tickets/with-documents (get tickets that have documents)
//    - DELETE /api/tickets/:ticketId/documents/:documentId (remove document from ticket)

// Mock data for development
const mockDocuments = [
  {
    id: "DOC-001",
    fileName: "customer-onboarding-guide.pdf",
    originalName: "Customer Onboarding Guide.pdf",
    fileType: "application/pdf",
    fileSize: 2456789,
    url: "/documents/customer-onboarding-guide.pdf",
    thumbnailUrl: "/thumbnails/customer-onboarding-guide.jpg",
    uploadedBy: "user-123",
    uploadedByName: "Sarah Johnson",
    uploadDate: new Date("2024-12-15T10:30:00Z"),
    lastModified: new Date("2024-12-15T10:30:00Z"),
    category: "Training",
    tags: ["onboarding", "customer", "guide"],
    description: "Complete guide for new customer onboarding process",
    isPublic: true,
    downloadCount: 45,
    metadata: { pages: 24 }
  },
  {
    id: "DOC-002",
    fileName: "product-demo-video.mp4",
    originalName: "Product Demo Video.mp4",
    fileType: "video/mp4",
    fileSize: 15678234,
    url: "/documents/product-demo-video.mp4",
    thumbnailUrl: "/thumbnails/product-demo-video.jpg",
    uploadedBy: "user-456",
    uploadedByName: "Mike Chen",
    uploadDate: new Date("2024-12-14T14:20:00Z"),
    lastModified: new Date("2024-12-14T14:20:00Z"),
    category: "Marketing",
    tags: ["product", "demo", "video"],
    description: "Product demonstration video for client presentations",
    isPublic: false,
    downloadCount: 12,
    metadata: { duration: 420 }
  },
  {
    id: "DOC-003",
    fileName: "api-documentation.docx",
    originalName: "API Documentation.docx",
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 987654,
    url: "/documents/api-documentation.docx",
    uploadedBy: "user-789",
    uploadedByName: "Alex Rodriguez",
    uploadDate: new Date("2024-12-13T09:15:00Z"),
    lastModified: new Date("2024-12-13T09:15:00Z"),
    category: "Technical",
    tags: ["api", "documentation", "technical"],
    description: "Complete API documentation for developers",
    isPublic: true,
    downloadCount: 78,
  },
  {
    id: "DOC-004",
    fileName: "company-logo.png",
    originalName: "Company Logo.png",
    fileType: "image/png",
    fileSize: 45678,
    url: "/documents/company-logo.png",
    thumbnailUrl: "/thumbnails/company-logo.png",
    uploadedBy: "user-101",
    uploadedByName: "Emma Davis",
    uploadDate: new Date("2024-12-12T16:45:00Z"),
    lastModified: new Date("2024-12-12T16:45:00Z"),
    category: "Branding",
    tags: ["logo", "branding", "image"],
    description: "Official company logo in high resolution",
    isPublic: true,
    downloadCount: 156,
    metadata: { dimensions: { width: 1920, height: 1080 } }
  },
  {
    id: "DOC-005",
    fileName: "quarterly-report.xlsx",
    originalName: "Q4 2024 Report.xlsx",
    fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    fileSize: 1234567,
    url: "/documents/quarterly-report.xlsx",
    uploadedBy: "user-202",
    uploadedByName: "David Wilson",
    uploadDate: new Date("2024-12-11T11:30:00Z"),
    lastModified: new Date("2024-12-11T11:30:00Z"),
    category: "Reports",
    tags: ["quarterly", "report", "analytics"],
    description: "Q4 2024 quarterly business report",
    isPublic: false,
    downloadCount: 23,
  }
];

// Mock data for ticket documents
const mockTicketDocuments = [
  {
    id: "TKT-001",
    ticketId: "TCK-001",
    ticketTitle: "Customer unable to access account",
    ticketStatus: "resolved" as const,
    customer: "Jane Doe",
    customerPhone: "+1-555-0123",
    customerEmail: "jane.doe@email.com",
    priority: "high" as const,
    category: "Account Access",
    createdAt: new Date("2024-12-15T08:00:00Z"),
    updatedAt: new Date("2024-12-15T16:30:00Z"),
    assignedAgentId: "agent-001",
    assignedAgentName: "Sarah Johnson",
    documents: [
      {
        id: "DOC-T001-1",
        fileName: "account-recovery-form.pdf",
        originalName: "Account Recovery Form - Jane Doe.pdf",
        fileType: "application/pdf",
        fileSize: 456789,
        url: "/documents/tickets/account-recovery-form.pdf",
        uploadedBy: "agent-001",
        uploadedByName: "Sarah Johnson",
        uploadDate: new Date("2024-12-15T09:15:00Z"),
        lastModified: new Date("2024-12-15T09:15:00Z"),
        category: "Forms",
        tags: ["account", "recovery", "form"],
        description: "Account recovery form submitted by customer",
        isPublic: false,
        downloadCount: 3,
        ticketId: "TCK-001"
      },
      {
        id: "DOC-T001-2",
        fileName: "id-verification.jpg",
        originalName: "ID Verification - Jane Doe.jpg",
        fileType: "image/jpeg",
        fileSize: 234567,
        url: "/documents/tickets/id-verification.jpg",
        thumbnailUrl: "/thumbnails/id-verification.jpg",
        uploadedBy: "agent-001",
        uploadedByName: "Sarah Johnson",
        uploadDate: new Date("2024-12-15T10:00:00Z"),
        lastModified: new Date("2024-12-15T10:00:00Z"),
        category: "Verification",
        tags: ["id", "verification", "customer"],
        description: "Customer ID verification document",
        isPublic: false,
        downloadCount: 2,
        ticketId: "TCK-001"
      }
    ],
    callTranscripts: ["Call transcript: Customer called regarding account access issues..."],
    notes: "Customer was locked out due to multiple failed login attempts. Reset password and verified identity.",
    resolutionSummary: "Account access restored after password reset and identity verification."
  },
  {
    id: "TKT-002",
    ticketId: "TCK-002",
    ticketTitle: "Billing dispute - incorrect charges",
    ticketStatus: "active" as const,
    customer: "John Smith",
    customerPhone: "+1-555-0456",
    customerEmail: "john.smith@email.com",
    priority: "medium" as const,
    category: "Billing",
    createdAt: new Date("2024-12-14T14:30:00Z"),
    updatedAt: new Date("2024-12-15T11:00:00Z"),
    assignedAgentId: "agent-002",
    assignedAgentName: "Mike Chen",
    documents: [
      {
        id: "DOC-T002-1",
        fileName: "billing-statement.pdf",
        originalName: "Billing Statement - John Smith.pdf",
        fileType: "application/pdf",
        fileSize: 345678,
        url: "/documents/tickets/billing-statement.pdf",
        uploadedBy: "agent-002",
        uploadedByName: "Mike Chen",
        uploadDate: new Date("2024-12-14T15:00:00Z"),
        lastModified: new Date("2024-12-14T15:00:00Z"),
        category: "Billing",
        tags: ["billing", "statement", "dispute"],
        description: "Customer's billing statement showing disputed charges",
        isPublic: false,
        downloadCount: 1,
        ticketId: "TCK-002"
      },
      {
        id: "DOC-T002-2",
        fileName: "payment-receipt.jpg",
        originalName: "Payment Receipt - John Smith.jpg",
        fileType: "image/jpeg",
        fileSize: 123456,
        url: "/documents/tickets/payment-receipt.jpg",
        thumbnailUrl: "/thumbnails/payment-receipt.jpg",
        uploadedBy: "customer-john",
        uploadedByName: "John Smith",
        uploadDate: new Date("2024-12-14T16:20:00Z"),
        lastModified: new Date("2024-12-14T16:20:00Z"),
        category: "Receipt",
        tags: ["payment", "receipt", "proof"],
        description: "Payment receipt uploaded by customer as proof of payment",
        isPublic: false,
        downloadCount: 2,
        ticketId: "TCK-002"
      }
    ],
    callTranscripts: ["Call transcript: Customer disputed charges on recent billing statement..."],
    notes: "Customer claims they were charged for services not received. Investigating billing records.",
    resolutionSummary: null
  },
  {
    id: "TKT-003",
    ticketId: "TCK-003",
    ticketTitle: "Technical issue - app crashes on startup",
    ticketStatus: "pending" as const,
    customer: "Sarah Johnson",
    customerPhone: "+1-555-0789",
    customerEmail: "sarah.johnson@email.com",
    priority: "urgent" as const,
    category: "Technical Support",
    createdAt: new Date("2024-12-13T10:15:00Z"),
    updatedAt: new Date("2024-12-15T09:30:00Z"),
    assignedAgentId: "agent-003",
    assignedAgentName: "Alex Rodriguez",
    documents: [
      {
        id: "DOC-T003-1",
        fileName: "error-log.txt",
        originalName: "App Error Log - Sarah Johnson.txt",
        fileType: "text/plain",
        fileSize: 15678,
        url: "/documents/tickets/error-log.txt",
        uploadedBy: "customer-sarah",
        uploadedByName: "Sarah Johnson",
        uploadDate: new Date("2024-12-13T11:00:00Z"),
        lastModified: new Date("2024-12-13T11:00:00Z"),
        category: "Logs",
        tags: ["error", "log", "technical"],
        description: "Application error log showing crash details",
        isPublic: false,
        downloadCount: 4,
        ticketId: "TCK-003"
      },
      {
        id: "DOC-T003-2",
        fileName: "screenshot.png",
        originalName: "App Screenshot - Error.png",
        fileType: "image/png",
        fileSize: 567890,
        url: "/documents/tickets/screenshot.png",
        thumbnailUrl: "/thumbnails/screenshot.png",
        uploadedBy: "customer-sarah",
        uploadedByName: "Sarah Johnson",
        uploadDate: new Date("2024-12-13T11:15:00Z"),
        lastModified: new Date("2024-12-13T11:15:00Z"),
        category: "Screenshots",
        tags: ["screenshot", "error", "app"],
        description: "Screenshot of the error message when app crashes",
        isPublic: false,
        downloadCount: 3,
        ticketId: "TCK-003"
      }
    ],
    callTranscripts: ["Call transcript: Customer reported app crashing immediately on startup..."],
    notes: "Customer experiencing app crashes on startup. Error logs and screenshots provided.",
    resolutionSummary: null
  }
];

const fileTypeCategories = ["All", "Training", "Marketing", "Technical", "Branding", "Reports"];
const ticketStatusCategories = ["All", "active", "pending", "resolved", "closed"];

const getFileIcon = (fileType: string | undefined) => {
  if (!fileType) return <File className="w-5 h-5" />;
  if (fileType.startsWith("image/")) return <Image className="w-5 h-5" />;
  if (fileType.startsWith("video/")) return <FileVideo className="w-5 h-5" />;
  if (fileType.includes("pdf")) return <FileText className="w-5 h-5" />;
  return <File className="w-5 h-5" />;
};

const getTicketStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <Clock className="w-4 h-4 text-blue-500" />;
    case "pending":
      return <Pause className="w-4 h-4 text-yellow-500" />;
    case "resolved":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "closed":
      return <XCircle className="w-4 h-4 text-gray-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-400" />;
  }
};

const getTicketStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    case "resolved":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    case "closed":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    case "high":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300";
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [ticketDocuments, setTicketDocuments] = useState(mockTicketDocuments);
  const [filteredTicketDocuments, setFilteredTicketDocuments] = useState(mockTicketDocuments);
  const [activeTab, setActiveTab] = useState<"documents" | "tickets">("documents");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTicketStatus, setSelectedTicketStatus] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API Configuration
  const API_BASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://fjdurojwqtqoydmqjvmk.supabase.co';
  const API_FUNCTIONS_URL = `${API_BASE_URL}/functions/v1`;

  // Get auth headers for API calls
  const getAuthHeaders = useCallback(() => {
    return {
      'Authorization': `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json'
    };
  }, []);

  // Fetch documents from backend
  const fetchDocuments = useCallback(async (options: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    fileType?: string;
    sort?: string;
    order?: string;
  } = {}) => {
    const accessToken = getAccessToken();
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: (options.page || pagination.page).toString(),
        limit: (options.limit || pagination.limit).toString(),
        sort: options.sort || 'upload_date',
        order: options.order || 'desc'
      });

      if (options.search) params.append('search', options.search);
      if (options.category && options.category !== 'All') params.append('category', options.category);
      if (options.fileType) params.append('type', options.fileType);

      const response = await fetch(`${API_FUNCTIONS_URL}/list-documents?${params}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data: DocumentListResponse = await response.json();
      
      if (data.success) {
        setDocuments(data.documents);
        setFilteredDocuments(data.documents);
        setPagination(data.pagination);
      } else {
        throw new Error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken(), pagination.page, pagination.limit, API_FUNCTIONS_URL, getAuthHeaders]);

  // Upload documents to backend
  const uploadDocument = useCallback(async (file: File, options: {
    category?: string;
    description?: string;
    isPublic?: boolean;
    ticketId?: string;
    callId?: string;
  } = {}): Promise<UploadResult> => {
    if (!getAccessToken()) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (options.category) formData.append('category', options.category);
      if (options.description) formData.append('description', options.description);
      formData.append('isPublic', (options.isPublic || true).toString());
      if (options.ticketId) formData.append('ticketId', options.ticketId);
      if (options.callId) formData.append('callId', options.callId);

      const response = await fetch(`${API_FUNCTIONS_URL}/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      
      if (data.success) {
        return { success: true, document: data.document };
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }, [getAccessToken(), API_FUNCTIONS_URL]);

  // Removed direct download helper as download buttons are removed

  // Delete document
  const deleteDocument = useCallback(async (documentId: string) => {
    if (!getAccessToken()) return;

    try {
      const response = await fetch(`${API_FUNCTIONS_URL}/delete-document/${documentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Delete failed');
      }

      const data = await response.json();
      
      if (data.success) {
        // Remove document from local state
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        setFilteredDocuments(prev => prev.filter(doc => doc.id !== documentId));
        toast.success('Document deleted successfully');
      } else {
        throw new Error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  }, [getAccessToken(), API_FUNCTIONS_URL, getAuthHeaders]);

  // Load documents on component mount and when auth changes
  useEffect(() => {
    if (getAccessToken() && activeTab === 'documents') {
      fetchDocuments();
    }
  }, [getAccessToken(), activeTab, fetchDocuments]);

  // Filter documents locally (for immediate feedback)
  const filterDocuments = useCallback(() => {
    let filtered = documents;

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, selectedCategory]);

  // Filter ticket documents based on search query and status
  const filterTicketDocuments = useCallback(() => {
    let filtered = ticketDocuments;

    if (searchQuery) {
      filtered = filtered.filter(ticket =>
        ticket.ticketTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.documents.some(doc => 
          doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (selectedTicketStatus !== "All") {
      filtered = filtered.filter(ticket => ticket.ticketStatus === selectedTicketStatus);
    }

    setFilteredTicketDocuments(filtered);
  }, [ticketDocuments, searchQuery, selectedTicketStatus]);

  // Apply filters when search query or category changes
  useEffect(() => {
    filterDocuments();
    filterTicketDocuments();
  }, [filterDocuments, filterTicketDocuments]);

  // Handle file upload with real backend integration
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || !getAccessToken()) return;

    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const fileKey = `${file.name}-${Date.now()}`;
      setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[fileKey] || 0;
            if (currentProgress < 90) {
              return { ...prev, [fileKey]: currentProgress + 10 };
            }
            return prev;
          });
        }, 100);

        const result = await uploadDocument(file, {
          category: selectedCategory === "All" ? "General" : selectedCategory,
          description: "",
          isPublic: true
        });

        clearInterval(progressInterval);

        if (result.success && result.document) {
          setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
          setDocuments(prev => [result.document!, ...prev]);
          setFilteredDocuments(prev => [result.document!, ...prev]);
          toast.success(`${file.name} uploaded successfully`);
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        // Remove progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileKey];
            return newProgress;
          });
        }, 2000);
      }
    }
  }, [selectedCategory, getAccessToken(), uploadDocument]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
  }, [handleFileUpload]);

  // Removed view/download handlers as action buttons are removed

  // Handle document deletion with confirmation
  const handleDeleteDocument = useCallback(async (document: Document) => {
    if (!window.confirm(`Are you sure you want to delete "${document.originalName}"?`)) {
      return;
    }
    
    await deleteDocument(document.id);
  }, [deleteDocument]);

  // Handle search with backend integration
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (activeTab === 'documents') {
      // Debounce search requests
      setTimeout(() => {
        fetchDocuments({
          search: query,
          category: selectedCategory,
          page: 1 // Reset to first page for new search
        });
      }, 300);
    }
  }, [activeTab, selectedCategory, fetchDocuments]);

  // Handle category change with backend integration
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    
    if (activeTab === 'documents') {
      fetchDocuments({
        search: searchQuery,
        category: category,
        page: 1 // Reset to first page for new filter
      });
    }
  }, [activeTab, searchQuery, fetchDocuments]);

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchDocuments({
      search: searchQuery,
      category: selectedCategory,
      page: newPage
    });
  }, [searchQuery, selectedCategory, fetchDocuments]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground">Upload, manage, and share documents</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("documents")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "documents"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>All Documents</span>
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "tickets"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Ticket Documents</span>
        </button>
      </div>

      {/* Upload Area - Only show on documents tab */}
      {activeTab === "documents" && (
        <Card className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? "border-primary bg-primary/10" 
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Upload Documents</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop files here, or click to select files
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="mb-2"
            >
              <Paperclip className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, PNG, JPG, MP4, etc.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{fileName}</span>
                      <span className="text-muted-foreground">{progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* AI-Powered Semantic Search */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-foreground mb-2">AI-Powered Document Search</h2>
          <p className="text-sm text-muted-foreground">
            Search through document content using natural language and semantic understanding
          </p>
        </div>
        <DocumentSearch 
          onResultClick={(result) => {
            // Handle semantic search result click
            console.log('Semantic search result clicked:', result);
            // Could open document viewer, navigate to document, etc.
          }}
        />
      </Card>

      {/* Basic Search and Filter */}
      <Card className="p-4">
        <div className="mb-3">
          <h3 className="text-sm font-medium text-foreground mb-1">Basic Search & Filter</h3>
          <p className="text-xs text-muted-foreground">Filter documents by name, category, and metadata</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder={
                activeTab === "documents" 
                  ? "Search documents..." 
                  : "Search tickets and documents..."
              }
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={activeTab === "documents" ? selectedCategory : selectedTicketStatus}
              onChange={(e) => 
                activeTab === "documents" 
                  ? handleCategoryChange(e.target.value)
                  : setSelectedTicketStatus(e.target.value)
              }
              className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
            >
              {(activeTab === "documents" ? fileTypeCategories : ticketStatusCategories).map(category => (
                <option key={category} value={category}>
                  {category === "All" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Documents List/Grid */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-foreground">
            {activeTab === "documents" 
              ? `Documents`
              : `Tickets with Documents (${filteredTicketDocuments.length})`
            }
          </h2>
          {isLoading && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>

        {activeTab === "documents" ? (
          // Regular Documents View
          isLoading && documents.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-foreground mb-2">Loading documents...</h3>
              <p className="text-muted-foreground">Please wait while we fetch your documents</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No documents found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "All" 
                  ? "Try adjusting your search or filter criteria" 
                  : "Upload your first document to get started"}
              </p>
            </div>
          ) : (
            <>
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-3"
              }>
                {filteredDocuments.map((document) => (
                  <div
                    key={document.id}
                    className={`border border-border rounded-lg p-4 hover:shadow-md transition-shadow bg-card ${
                      viewMode === "list" ? "flex items-center space-x-4" : ""
                    }`}
                  >
                    {viewMode === "grid" ? (
                      // Grid View
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getFileIcon(document.fileType)}
                            <span className="text-sm text-muted-foreground">
                              {document.fileType?.split('/')[1]?.toUpperCase()}
                            </span>
                          </div>
                          {document.processing && (
                            <div className="flex items-center space-x-1">
                              {document.processing.status === 'processing' ? (
                                <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                              ) : document.processing.status === 'completed' ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : document.processing.status === 'failed' ? (
                                <XCircle className="w-3 h-3 text-red-500" />
                              ) : null}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground truncate" title={document.originalName}>
                            {document.originalName}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {document.description || "No description"}
                          </p>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{document.uploadedByName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(new Date(document.uploadDate))}</span>
                          </div>
                          <div>{formatFileSize(document.fileSize)}</div>
                          {document.downloadCount > 0 && (
                            <div className="flex items-center space-x-1">
                              <Download className="w-3 h-3" />
                              <span>{document.downloadCount} downloads</span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end items-center">
                          {document.uploadedBy === user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(document)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      // List View
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getFileIcon(document.fileType)}
                          <div>
                            <h3 className="font-medium text-foreground">{document.originalName}</h3>
                            <p className="text-sm text-muted-foreground">{document.description || "No description"}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{document.uploadedByName}</span>
                          <span>{formatDate(new Date(document.uploadDate))}</span>
                          <span>{formatFileSize(document.fileSize)}</span>
                          <div className="flex items-center space-x-2">
                            {document.uploadedBy === user?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDocument(document)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} documents
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )
        ) : (
          // Ticket Documents View
          filteredTicketDocuments.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No tickets with documents found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedTicketStatus !== "All" 
                  ? "Try adjusting your search or filter criteria" 
                  : "No tickets have documents attached yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTicketDocuments.map((ticket) => (
                <div key={ticket.id} className="border border-border rounded-lg p-6 bg-card">
                  {/* Ticket Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Ticket className="w-5 h-5 text-muted-foreground" />
                        <h3 className="text-lg font-medium text-foreground">{ticket.ticketTitle}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTicketStatusColor(ticket.ticketStatus)}`}>
                          {ticket.ticketStatus.charAt(0).toUpperCase() + ticket.ticketStatus.slice(1)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Customer:</span> {ticket.customer}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {ticket.category}
                        </div>
                        <div>
                          <span className="font-medium">Assigned to:</span> {ticket.assignedAgentName}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(ticket.createdAt)}
                        </div>
                        {ticket.customerPhone && (
                          <div>
                            <span className="font-medium">Phone:</span> {ticket.customerPhone}
                          </div>
                        )}
                        {ticket.customerEmail && (
                          <div>
                            <span className="font-medium">Email:</span> {ticket.customerEmail}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getTicketStatusIcon(ticket.ticketStatus)}
                    </div>
                  </div>

                  {/* Ticket Notes */}
                  {ticket.notes && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <h4 className="text-sm font-medium text-foreground mb-1">Notes</h4>
                      <p className="text-sm text-muted-foreground">{ticket.notes}</p>
                    </div>
                  )}

                  {/* Resolution Summary */}
                  {ticket.resolutionSummary && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">Resolution Summary</h4>
                      <p className="text-sm text-green-700 dark:text-green-200">{ticket.resolutionSummary}</p>
                    </div>
                  )}

                  {/* Documents */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Documents ({ticket.documents.length})
                    </h4>
                    <div className={
                      viewMode === "grid" 
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                        : "space-y-2"
                    }>
                      {ticket.documents.map((document) => (
                        <div
                          key={document.id}
                          className={`border border-border rounded-lg p-3 hover:shadow-sm transition-shadow bg-card ${
                            viewMode === "list" ? "flex items-center space-x-3" : ""
                          }`}
                        >
                          {viewMode === "grid" ? (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                {getFileIcon(document.fileType)}
                                <span className="text-xs text-muted-foreground">{document.fileType.split('/')[1]?.toUpperCase()}</span>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-foreground truncate" title={document.originalName}>
                                  {document.originalName}
                                </h5>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {document.description || "No description"}
                                </p>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{formatFileSize(document.fileSize)}</span>
                                {/* View/Download buttons removed */}
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {getFileIcon(document.fileType)}
                                <div>
                                  <h5 className="text-sm font-medium text-foreground">{document.originalName}</h5>
                                  <p className="text-xs text-muted-foreground">{document.description || "No description"}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                <span>{formatFileSize(document.fileSize)}</span>
                                {/* View/Download buttons removed */}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </Card>
    </div>
  );
}
