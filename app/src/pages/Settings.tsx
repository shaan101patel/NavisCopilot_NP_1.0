import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { setUser } from '@/store/userSlice'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Phone, Plus, Trash2, Edit3 } from 'lucide-react'

// Phone number interface for type safety
interface PhoneNumber {
  id: string;
  number: string;
  label: string;
  isPrimary: boolean;
  isActive: boolean;
}

// Icons
const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const BellIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.021 9.869A9.008 9.008 0 019.869 4.02 9.008 9.008 0 0115.131 9.869c0 1.45-.302 2.83-.845 4.083L12 17l-2.286-3.048A8.965 8.965 0 014.021 9.869z" />
  </svg>
)

const SecurityIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const DisplayIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

export default function Settings() {
  const { user } = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()
  
  // Local state for form inputs
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    callReminders: true,
    ticketUpdates: true,
  })
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    autoSave: true,
  })

  // Phone number configuration state
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([
    {
      id: '1',
      number: '+1 (555) 123-4567',
      label: 'Main Office',
      isPrimary: true,
      isActive: true
    },
    {
      id: '2',
      number: '+1 (555) 987-6543',
      label: 'Support Line',
      isPrimary: false,
      isActive: true
    }
  ])
  const [newPhoneNumber, setNewPhoneNumber] = useState('')
  const [newPhoneLabel, setNewPhoneLabel] = useState('')
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null)

  const handleSaveProfile = () => {
    if (user) {
      dispatch(setUser({
        ...user,
        name,
        email,
      }))
      alert('Profile updated successfully!')
    }
  }

  const handleSaveNotifications = () => {
    // In a real app, this would make an API call to save notification preferences
    alert('Notification preferences saved!')
  }

  const handleSavePreferences = () => {
    // In a real app, this would make an API call to save user preferences
    alert('Preferences saved!')
  }

  // Phone number management functions
  const handleAddPhoneNumber = () => {
    if (!newPhoneNumber.trim() || !newPhoneLabel.trim()) {
      alert('Please enter both phone number and label')
      return
    }

    // IMPLEMENT LATER: Add phone number via API
    // Expected API call:
    // POST /api/user/phone-numbers
    // Payload: { number: string, label: string, isPrimary: boolean }
    // Response: { id: string, number: string, label: string, isPrimary: boolean, isActive: boolean }
    
    const newPhone: PhoneNumber = {
      id: Date.now().toString(),
      number: newPhoneNumber,
      label: newPhoneLabel,
      isPrimary: phoneNumbers.length === 0, // First number becomes primary
      isActive: true
    }

    setPhoneNumbers([...phoneNumbers, newPhone])
    setNewPhoneNumber('')
    setNewPhoneLabel('')
    alert('Phone number added successfully!')
  }

  const handleDeletePhoneNumber = (id: string) => {
    const phoneToDelete = phoneNumbers.find(p => p.id === id)
    if (phoneToDelete?.isPrimary && phoneNumbers.length > 1) {
      alert('Cannot delete primary phone number. Please set another number as primary first.')
      return
    }

    // IMPLEMENT LATER: Delete phone number via API
    // Expected API call:
    // DELETE /api/user/phone-numbers/{id}
    // Response: { success: boolean }
    
    setPhoneNumbers(phoneNumbers.filter(p => p.id !== id))
    alert('Phone number deleted successfully!')
  }

  const handleSetPrimaryPhone = (id: string) => {
    // IMPLEMENT LATER: Update primary phone via API
    // Expected API call:
    // PUT /api/user/phone-numbers/{id}/set-primary
    // Response: { success: boolean }
    
    setPhoneNumbers(phoneNumbers.map(phone => ({
      ...phone,
      isPrimary: phone.id === id
    })))
    alert('Primary phone number updated!')
  }

  const handleTogglePhoneStatus = (id: string) => {
    // IMPLEMENT LATER: Toggle phone status via API
    // Expected API call:
    // PUT /api/user/phone-numbers/{id}/toggle-status
    // Response: { success: boolean, isActive: boolean }
    
    setPhoneNumbers(phoneNumbers.map(phone => 
      phone.id === id ? { ...phone, isActive: !phone.isActive } : phone
    ))
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
          <Card className="p-6">
            <p className="text-gray-500">Please sign in to access settings.</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <UserIcon />
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <Input
                  type="text"
                  value={user.role}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
              </div>
            </div>
            
            <div className="mt-6">
              <Button onClick={handleSaveProfile}>Save Profile Changes</Button>
            </div>
          </Card>

          {/* Phone Number Configuration */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="h-5 w-5" />
              <h2 className="text-lg font-semibold text-gray-900">Phone Number Configuration</h2>
            </div>
            
            <div className="space-y-4">
              {/* Existing Phone Numbers */}
              <div className="space-y-3">
                {phoneNumbers.map((phone) => (
                  <div key={phone.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{phone.number}</span>
                        {phone.isPrimary && (
                          <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                            Primary
                          </span>
                        )}
                        {!phone.isActive && (
                          <span className="px-2 py-1 text-xs bg-gray-400 text-white rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{phone.label}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!phone.isPrimary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPrimaryPhone(phone.id)}
                          className="text-xs"
                          title="Set as primary phone number"
                        >
                          Set Primary
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePhoneStatus(phone.id)}
                        className={`text-xs ${phone.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                        title={phone.isActive ? 'Deactivate phone number' : 'Activate phone number'}
                      >
                        {phone.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePhoneNumber(phone.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                        title="Delete phone number"
                        aria-label={`Delete phone number ${phone.number}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Add New Phone Number */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-md font-medium text-gray-900 mb-3">Add New Phone Number</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={newPhoneNumber}
                      onChange={(e) => setNewPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label
                    </label>
                    <Input
                      type="text"
                      value={newPhoneLabel}
                      onChange={(e) => setNewPhoneLabel(e.target.value)}
                      placeholder="e.g., Main Office, Support Line"
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <Button
                    onClick={handleAddPhoneNumber}
                    className="flex items-center gap-2"
                    disabled={!newPhoneNumber.trim() || !newPhoneLabel.trim()}
                  >
                    <Plus size={16} />
                    Add Phone Number
                  </Button>
                </div>
              </div>
              
              {/* Phone Configuration Help */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Phone Number Configuration</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Primary:</strong> The main phone number used for outbound calls</li>
                  <li>• <strong>Active:</strong> Phone numbers available for making calls</li>
                  <li>• <strong>Inactive:</strong> Phone numbers temporarily disabled</li>
                  <li>• You must have at least one active phone number</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BellIcon />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Call Reminders</p>
                  <p className="text-sm text-gray-500">Get reminded about upcoming calls</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.callReminders}
                    onChange={(e) => setNotifications({...notifications, callReminders: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Ticket Updates</p>
                  <p className="text-sm text-gray-500">Notifications when tickets are updated</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.ticketUpdates}
                    onChange={(e) => setNotifications({...notifications, ticketUpdates: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
            
            <div className="mt-6">
              <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
            </div>
          </Card>

          {/* Display Preferences */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <DisplayIcon />
              <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select
                  value={preferences.theme}
                  onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="CST">Central Time</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Auto-save</p>
                  <p className="text-sm text-gray-500">Automatically save changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.autoSave}
                    onChange={(e) => setPreferences({...preferences, autoSave: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
            
            <div className="mt-6">
              <Button onClick={handleSavePreferences}>Save Preferences</Button>
            </div>
          </Card>

          {/* Security Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <SecurityIcon />
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            </div>
            
            <div className="space-y-4">
              <Button variant="outline" className="w-full md:w-auto">
                Change Password
              </Button>
              
              <Button variant="outline" className="w-full md:w-auto">
                Enable Two-Factor Authentication
              </Button>
              
              <Button variant="outline" className="w-full md:w-auto">
                Download Account Data
              </Button>
              
              <div className="pt-4 border-t border-gray-200">
                <Button variant="destructive" className="w-full md:w-auto">
                  Delete Account
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
