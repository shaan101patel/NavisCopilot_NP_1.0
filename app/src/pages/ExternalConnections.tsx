import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from '@/components/ui/modal'

// Icons
interface IconProps {
  className?: string
}

const ConnectionIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.1m0 0l4-4a4 4 0 105.656-5.656l-1.1 1.1" />
  </svg>
)

const PlusIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const EditIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const DeleteIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const TestIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const EyeIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOffIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
)

// Connection type enum for better type safety
enum ConnectionType {
  CRM = 'CRM',
  DATABASE = 'Database',
  EMAIL = 'Email',
  CALENDAR = 'Calendar',
  ANALYTICS = 'Analytics',
  OTHER = 'Other'
}

// Connection status enum
enum ConnectionStatus {
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
  ERROR = 'Error',
  TESTING = 'Testing'
}

// Expected data structure for backend integration
interface ExternalConnection {
  id: string
  type: ConnectionType
  serviceName: string
  accountName: string
  status: ConnectionStatus
  lastSynced: Date
  credentials: {
    // Credentials object structure will depend on the connection type
    // For API connections: { apiKey: string, apiSecret?: string }
    // For OAuth: { accessToken: string, refreshToken: string, expiresAt: Date }
    // For database: { host: string, port: number, username: string, password: string, database: string }
    [key: string]: any
  }
  settings?: {
    syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'weekly'
    enabledFeatures?: string[]
    customMappings?: Record<string, string>
  }
  createdAt: Date
  updatedAt: Date
}

// Form data interface for connection creation/editing
interface ConnectionFormData {
  type: ConnectionType
  serviceName: string
  accountName: string
  credentialType: 'api' | 'oauth' | 'database' | 'other'
  apiKey?: string
  apiSecret?: string
  username?: string
  password?: string
  host?: string
  port?: string
  database?: string
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
}

// Mock data for demonstration
const mockConnections: ExternalConnection[] = [
  {
    id: '1',
    type: ConnectionType.CRM,
    serviceName: 'Salesforce',
    accountName: 'Navis Production',
    status: ConnectionStatus.CONNECTED,
    lastSynced: new Date('2025-01-10T10:30:00Z'),
    credentials: { apiKey: '***hidden***' },
    settings: { syncFrequency: 'hourly' },
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-10T10:30:00Z')
  },
  {
    id: '2',
    type: ConnectionType.DATABASE,
    serviceName: 'Supabase',
    accountName: 'navis-dev-db',
    status: ConnectionStatus.CONNECTED,
    lastSynced: new Date('2025-01-10T11:00:00Z'),
    credentials: { host: 'db.supabase.co', username: 'navis_user' },
    settings: { syncFrequency: 'realtime' },
    createdAt: new Date('2025-01-05T00:00:00Z'),
    updatedAt: new Date('2025-01-10T11:00:00Z')
  },
  {
    id: '3',
    type: ConnectionType.EMAIL,
    serviceName: 'SendGrid',
    accountName: 'notifications@navis.ai',
    status: ConnectionStatus.ERROR,
    lastSynced: new Date('2025-01-09T15:45:00Z'),
    credentials: { apiKey: '***hidden***' },
    settings: { syncFrequency: 'daily' },
    createdAt: new Date('2025-01-03T00:00:00Z'),
    updatedAt: new Date('2025-01-09T15:45:00Z')
  }
]

export default function ExternalConnections() {
  const [connections, setConnections] = useState<ExternalConnection[]>(mockConnections)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<ExternalConnection | null>(null)
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({})
  const [isTestingConnection, setIsTestingConnection] = useState<string | null>(null)

  // Form state for add/edit modals
  const [formData, setFormData] = useState<ConnectionFormData>({
    type: ConnectionType.CRM,
    serviceName: '',
    accountName: '',
    credentialType: 'api',
    apiKey: '',
    apiSecret: '',
    username: '',
    password: '',
    host: '',
    port: '',
    database: '',
    syncFrequency: 'hourly'
  })

  const resetForm = () => {
    setFormData({
      type: ConnectionType.CRM,
      serviceName: '',
      accountName: '',
      credentialType: 'api',
      apiKey: '',
      apiSecret: '',
      username: '',
      password: '',
      host: '',
      port: '',
      database: '',
      syncFrequency: 'hourly'
    })
  }

  const handleAddConnection = () => {
    setIsAddModalOpen(true)
    resetForm()
  }

  const handleEditConnection = (connection: ExternalConnection) => {
    setSelectedConnection(connection)
    setFormData({
      type: connection.type,
      serviceName: connection.serviceName,
      accountName: connection.accountName,
      credentialType: 'api', // Default, would be determined by examining credentials
      syncFrequency: connection.settings?.syncFrequency || 'hourly',
      // Other fields would be populated based on connection type
      apiKey: '',
      apiSecret: '',
      username: '',
      password: '',
      host: '',
      port: '',
      database: ''
    })
    setIsEditModalOpen(true)
  }

  const handleViewDetails = (connection: ExternalConnection) => {
    setSelectedConnection(connection)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteConnection = (connection: ExternalConnection) => {
    setSelectedConnection(connection)
    setIsDeleteModalOpen(true)
  }

  const handleTestConnection = async (connectionId: string) => {
    setIsTestingConnection(connectionId)
    
    // IMPLEMENT LATER: Backend API call to test connection
    // Expected endpoint: POST /api/connections/{connectionId}/test
    // Expected response: { success: boolean, message: string, latency?: number }
    
    // Simulate API call
    setTimeout(() => {
      setIsTestingConnection(null)
      alert('Connection test completed successfully!')
    }, 2000)
  }

  const handleSaveConnection = () => {
    if (isAddModalOpen) {
      // IMPLEMENT LATER: Backend API call to create new connection
      // Expected endpoint: POST /api/connections
      // Expected payload: ConnectionFormData
      // Expected response: ExternalConnection (created connection with ID)
      
      const newConnection: ExternalConnection = {
        id: Date.now().toString(),
        type: formData.type,
        serviceName: formData.serviceName,
        accountName: formData.accountName,
        status: ConnectionStatus.DISCONNECTED,
        lastSynced: new Date(),
        credentials: { apiKey: formData.apiKey }, // Simplified for demo
        settings: { syncFrequency: formData.syncFrequency },
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setConnections([...connections, newConnection])
      setIsAddModalOpen(false)
      resetForm()
    } else if (isEditModalOpen && selectedConnection) {
      // IMPLEMENT LATER: Backend API call to update connection
      // Expected endpoint: PUT /api/connections/{connectionId}
      // Expected payload: Partial<ConnectionFormData>
      // Expected response: ExternalConnection (updated connection)
      
      const updatedConnections = connections.map(conn =>
        conn.id === selectedConnection.id
          ? {
              ...conn,
              type: formData.type,
              serviceName: formData.serviceName,
              accountName: formData.accountName,
              settings: { ...conn.settings, syncFrequency: formData.syncFrequency },
              updatedAt: new Date()
            }
          : conn
      )
      
      setConnections(updatedConnections)
      setIsEditModalOpen(false)
      setSelectedConnection(null)
      resetForm()
    }
  }

  const confirmDeleteConnection = () => {
    if (selectedConnection) {
      // IMPLEMENT LATER: Backend API call to delete connection
      // Expected endpoint: DELETE /api/connections/{connectionId}
      // Expected response: { success: boolean, message: string }
      
      setConnections(connections.filter(conn => conn.id !== selectedConnection.id))
      setIsDeleteModalOpen(false)
      setSelectedConnection(null)
    }
  }

  const toggleCredentialVisibility = (connectionId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [connectionId]: !prev[connectionId]
    }))
  }

  const getStatusBadgeColor = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return 'bg-green-100 text-green-800 border-green-200'
      case ConnectionStatus.DISCONNECTED:
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case ConnectionStatus.ERROR:
        return 'bg-red-100 text-red-800 border-red-200'
      case ConnectionStatus.TESTING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatLastSynced = (date: Date) => {
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Beta Disclaimer Banner */}
        <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Beta Feature - Coming Soon
              </h3>
              <div className="mt-2 text-sm text-orange-700 dark:text-orange-300">
                <p>
                  External Connections is currently in development. This preview shows the planned interface 
                  and functionality. Backend integration and live connection testing are not yet available. 
                  All connections shown are mock data for demonstration purposes.
                </p>
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                  Preview Mode
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ConnectionIcon />
            <h1 className="text-2xl font-bold text-gray-900">External Connections</h1>
          </div>
          <Button
            onClick={handleAddConnection}
            className="flex items-center gap-2"
            aria-label="Add new external connection"
          >
            <PlusIcon />
            Add External Connection
          </Button>
        </div>

        {/* Connections List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection) => (
            <Card key={connection.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{connection.serviceName}</CardTitle>
                    <CardDescription className="mt-1">
                      {connection.type} • {connection.accountName}
                    </CardDescription>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(connection.status)}`}
                  >
                    {connection.status}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Last synced:</span>
                    <span>{formatLastSynced(connection.lastSynced)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sync frequency:</span>
                    <span className="capitalize">{connection.settings?.syncFrequency || 'hourly'}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(connection)}
                  className="flex items-center gap-1"
                  aria-label={`View details for ${connection.serviceName}`}
                >
                  <EyeIcon />
                  View Details
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection(connection.id)}
                    disabled={isTestingConnection === connection.id}
                    className="flex items-center gap-1"
                    aria-label={`Test connection to ${connection.serviceName}`}
                  >
                    <TestIcon />
                    {isTestingConnection === connection.id ? 'Testing...' : 'Test'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditConnection(connection)}
                    className="flex items-center gap-1"
                    aria-label={`Edit ${connection.serviceName} connection`}
                  >
                    <EditIcon />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteConnection(connection)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    aria-label={`Delete ${connection.serviceName} connection`}
                  >
                    <DeleteIcon />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {connections.length === 0 && (
          <Card className="p-12 text-center">
            <ConnectionIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No external connections</h3>
            <p className="text-gray-500 mb-6">
              Get started by connecting your first external service or platform.
            </p>
            <Button onClick={handleAddConnection} className="flex items-center gap-2 mx-auto">
              <PlusIcon />
              Add Your First Connection
            </Button>
          </Card>
        )}

        {/* Add Connection Modal */}
        <Modal open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <ModalContent className="max-w-2xl">
            <ModalHeader>
              <ModalTitle>Add External Connection</ModalTitle>
              <ModalDescription>
                Connect a new external service or platform to Navis.
              </ModalDescription>
            </ModalHeader>

            <ModalBody className="space-y-6">
              {/* Connection Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connection Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ConnectionType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  aria-label="Select connection type"
                >
                  {Object.values(ConnectionType).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name *
                </label>
                <Input
                  type="text"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  placeholder="e.g., Salesforce, HubSpot, Supabase"
                  required
                  aria-label="Enter service name"
                />
              </div>

              {/* Account/Instance Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account/Instance Name *
                </label>
                <Input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="e.g., Navis Production, dev-instance"
                  required
                  aria-label="Enter account or instance name"
                />
              </div>

              {/* Credential Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authentication Method *
                </label>
                <select
                  value={formData.credentialType}
                  onChange={(e) => setFormData({ ...formData, credentialType: e.target.value as 'api' | 'oauth' | 'database' | 'other' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  aria-label="Select authentication method"
                >
                  <option value="api">API Key</option>
                  <option value="oauth">OAuth</option>
                  <option value="database">Database Credentials</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Conditional Credential Fields */}
              {formData.credentialType === 'api' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key *
                    </label>
                    <Input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder="Enter your API key"
                      required
                      aria-label="Enter API key"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Secret (Optional)
                    </label>
                    <Input
                      type="password"
                      value={formData.apiSecret}
                      onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                      placeholder="Enter your API secret if required"
                      aria-label="Enter API secret"
                    />
                  </div>
                </div>
              )}

              {formData.credentialType === 'database' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Host *
                      </label>
                      <Input
                        type="text"
                        value={formData.host}
                        onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                        placeholder="db.example.com"
                        required
                        aria-label="Enter database host"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Port
                      </label>
                      <Input
                        type="text"
                        value={formData.port}
                        onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                        placeholder="5432"
                        aria-label="Enter database port"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Database Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.database}
                      onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                      placeholder="navis_production"
                      required
                      aria-label="Enter database name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username *
                      </label>
                      <Input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="db_user"
                        required
                        aria-label="Enter database username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter password"
                        required
                        aria-label="Enter database password"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sync Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sync Frequency
                </label>
                <select
                  value={formData.syncFrequency}
                  onChange={(e) => setFormData({ ...formData, syncFrequency: e.target.value as 'realtime' | 'hourly' | 'daily' | 'weekly' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  aria-label="Select sync frequency"
                >
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // IMPLEMENT LATER: Test connection before saving
                  // Expected API call: POST /api/connections/test
                  // Expected payload: ConnectionFormData
                  // Expected response: { success: boolean, message: string }
                  alert('Testing connection... (placeholder)')
                }}
                variant="outline"
              >
                Test Connection
              </Button>
              <Button onClick={handleSaveConnection}>
                Save Connection
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Connection Modal */}
        <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <ModalContent className="max-w-2xl">
            <ModalHeader>
              <ModalTitle>Edit Connection</ModalTitle>
              <ModalDescription>
                Update the settings for {selectedConnection?.serviceName}.
              </ModalDescription>
            </ModalHeader>

            <ModalBody className="space-y-6">
              {/* Same form fields as Add modal - implementation would be identical */}
              {/* For brevity, showing key fields only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name *
                </label>
                <Input
                  type="text"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  placeholder="e.g., Salesforce, HubSpot, Supabase"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account/Instance Name *
                </label>
                <Input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="e.g., Navis Production, dev-instance"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sync Frequency
                </label>
                <select
                  value={formData.syncFrequency}
                  onChange={(e) => setFormData({ ...formData, syncFrequency: e.target.value as 'realtime' | 'hourly' | 'daily' | 'weekly' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveConnection}>
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Connection Details Modal */}
        <Modal open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <ModalContent className="max-w-2xl">
            <ModalHeader>
              <ModalTitle>{selectedConnection?.serviceName} Details</ModalTitle>
              <ModalDescription>
                View detailed information about this connection.
              </ModalDescription>
            </ModalHeader>

            <ModalBody className="space-y-6">
              {selectedConnection && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Connection Type</h4>
                      <p className="text-gray-600">{selectedConnection.type}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(selectedConnection.status)}`}>
                        {selectedConnection.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Account Name</h4>
                      <p className="text-gray-600">{selectedConnection.accountName}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Last Synced</h4>
                      <p className="text-gray-600">{formatLastSynced(selectedConnection.lastSynced)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Credentials</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {showCredentials[selectedConnection.id] 
                            ? JSON.stringify(selectedConnection.credentials, null, 2)
                            : '••••••••••••••••'
                          }
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCredentialVisibility(selectedConnection.id)}
                          className="ml-2"
                          aria-label={showCredentials[selectedConnection.id] ? 'Hide credentials' : 'Show credentials'}
                        >
                          {showCredentials[selectedConnection.id] ? <EyeOffIcon /> : <EyeIcon />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Created</h4>
                      <p className="text-gray-600">{selectedConnection.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
                      <p className="text-gray-600">{selectedConnection.updatedAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </>
              )}
            </ModalBody>

            <ModalFooter>
              <Button
                variant="outline"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsDetailsModalOpen(false)
                  if (selectedConnection) {
                    handleEditConnection(selectedConnection)
                  }
                }}
              >
                Edit Connection
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Delete Connection</ModalTitle>
              <ModalDescription>
                Are you sure you want to delete the connection to {selectedConnection?.serviceName}? 
                This action cannot be undone.
              </ModalDescription>
            </ModalHeader>

            <ModalBody>
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Warning
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        Deleting this connection will stop all data synchronization and remove 
                        all associated configurations. Any automations relying on this connection 
                        will stop working.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteConnection}
              >
                Delete Connection
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  )
}
