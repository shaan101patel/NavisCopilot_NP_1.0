import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { profileAPI } from '@/services/supabase'

// Icons
const PhoneIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const EditIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

interface Agent {
  id: string
  full_name: string
  email: string
  role: string
  phone_number?: string
  department?: string
}

export default function InboundNumbers() {
  const { user } = useSelector((state: RootState) => state.user)
  
  // State
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Check if user has permission to manage numbers
  const hasPermission = user?.role === 'admin'

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      const agentsData = await profileAPI.getInboundNumbers()
      setAgents(agentsData)
    } catch (error: any) {
      console.error('Failed to load agents:', error)
      alert(error.message || 'Failed to load agent data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent)
    setPhoneNumber(agent.phone_number || '')
    setIsEditModalOpen(true)
  }

  const handleUpdatePhoneNumber = async () => {
    if (!selectedAgent) return

    // Validate phone number if provided
    if (phoneNumber && !/^[\+]?[0-9\s\-\(\)]{10,20}$/.test(phoneNumber)) {
      alert('Please enter a valid phone number')
      return
    }

    setIsUpdating(true)
    try {
      await profileAPI.updateInboundNumber(
        selectedAgent.id, 
        phoneNumber.trim() || null
      )

      // Update local state
      setAgents(agents.map(agent => 
        agent.id === selectedAgent.id 
          ? { ...agent, phone_number: phoneNumber.trim() || undefined }
          : agent
      ))

      alert('Phone number updated successfully!')
      setIsEditModalOpen(false)
      setSelectedAgent(null)
      setPhoneNumber('')
    } catch (error: any) {
      console.error('Failed to update phone number:', error)
      alert(error.message || 'Failed to update phone number')
    } finally {
      setIsUpdating(false)
    }
  }

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Inbound Numbers</h1>
          <Card className="p-6">
            <p className="text-gray-500">Please sign in to access this page.</p>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Inbound Numbers</h1>
          <Card className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading agents...</span>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inbound Numbers</h1>
            <p className="text-gray-600 mt-1">
              Manage phone number assignments for agents
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PhoneIcon />
            <span className="text-sm text-gray-600">
              {agents.filter(a => a.phone_number).length} of {agents.length} agents have numbers
            </span>
          </div>
        </div>

        {!hasPermission && (
          <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-800">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-medium">Limited Access:</span>
              <span>You can only view and edit your own phone number.</span>
            </div>
          </Card>
        )}

        <div className="grid gap-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                    <UserIcon />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {agent.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">{agent.email}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-500">
                        {formatRole(agent.role)}
                      </span>
                      {agent.department && (
                        <span className="text-sm text-gray-500">
                          • {agent.department}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <PhoneIcon />
                      <span className="font-medium text-gray-900">
                        {agent.phone_number || 'No number assigned'}
                      </span>
                    </div>
                    {agent.phone_number && (
                      <p className="text-sm text-green-600 mt-1">Active</p>
                    )}
                  </div>

                  {(hasPermission || agent.id === user.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAgent(agent)}
                      className="flex items-center gap-2"
                    >
                      <EditIcon />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {agents.length === 0 && (
          <Card className="p-8 text-center">
            <PhoneIcon />
            <h3 className="text-lg font-semibold text-gray-900 mt-2">
              No agents found
            </h3>
            <p className="text-gray-600 mt-1">
              There are no agents available to assign phone numbers to.
            </p>
          </Card>
        )}

        {/* Edit Phone Number Modal */}
        <Modal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        >
          <h2 className="text-lg font-semibold mb-4">
            Edit Phone Number - {selectedAgent?.full_name}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number (e.g., +1 555-123-4567)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to remove the phone number assignment
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleUpdatePhoneNumber} 
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? 'Updating...' : 'Update Number'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
} 