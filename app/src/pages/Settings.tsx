import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { setUser } from '@/store/userSlice'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { profileAPI } from '@/services/supabase'

// Icons
const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const BellIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12H4l5-5v5z" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const GlobeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
)

export default function Settings() {
  const { user } = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()

  // All hooks must be before any early return!
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  const [profileData, setProfileData] = useState({
    full_name: user?.name || '',
    phone_number: user?.phone_number || '',
  })

  // Use the expected API keys for notifications
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    callReminders: true,
    ticketUpdates: true,
    systemAlerts: true,
    messages: true,
  })

  // Use the expected API keys for security
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30,
    twoFactorEnabled: false,
  })

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    auto_save: true,
    default_call_recording: true,
  })

  // Load user settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoadingSettings(true)
        const settings = await profileAPI.getUserSettings()
        if (settings.notifications) {
          setNotificationSettings({ ...notificationSettings, ...settings.notifications })
        }
        if (settings.preferences) {
          setPreferences({ ...preferences, ...settings.preferences })
        }
        if (settings.security) {
          setSecuritySettings({ ...securitySettings, ...settings.security })
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setIsLoadingSettings(false)
      }
    }
    if (user?.id) loadSettings()
    // eslint-disable-next-line
  }, [user?.id])

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
          <Card className="p-6">
            <p className="text-gray-500">Please sign in to view your settings.</p>
          </Card>
        </div>
      </div>
    )
  }

  const handleSaveProfile = async () => {
    if (!profileData.full_name) {
      alert('Full name is required')
      return
    }
    setIsLoading(true)
    try {
      await profileAPI.updateProfile({
        full_name: profileData.full_name,
        phone_number: profileData.phone_number,
      })
      dispatch(setUser({
        ...user,
        name: profileData.full_name,
        phone_number: profileData.phone_number,
      }))
      alert('Profile updated successfully!')
    } catch (error: any) {
      console.error('Profile update error:', error)
      alert(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsLoading(true)
    try {
      await profileAPI.updateUserSettings({
        notifications: notificationSettings,
      })
      alert('Notification settings saved successfully!')
    } catch (error: any) {
      console.error('Notification settings error:', error)
      alert(error.message || 'Failed to save notification settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    setIsLoading(true)
    try {
      await profileAPI.updateUserSettings({
        preferences: preferences,
      })
      alert('Preferences saved successfully!')
    } catch (error: any) {
      console.error('Preferences error:', error)
      alert(error.message || 'Failed to save preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSecurity = async () => {
    setIsLoading(true)
    try {
      await profileAPI.updateUserSettings({
        security: securitySettings,
      })
      alert('Security settings saved successfully!')
    } catch (error: any) {
      console.error('Security settings error:', error)
      alert(error.message || 'Failed to save security settings')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingSettings) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading settings...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        {/* Profile Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <UserIcon />
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <Input
                type="text"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                value={profileData.phone_number}
                onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button onClick={handleSaveProfile} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <BellIcon />
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(notificationSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </label>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    [key]: e.target.checked
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <Button onClick={handleSaveNotifications} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Notifications'}
            </Button>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <GlobeIcon />
            <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={preferences.theme}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Auto Save</label>
              <input
                type="checkbox"
                checked={preferences.auto_save}
                onChange={(e) => setPreferences({ ...preferences, auto_save: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Default Call Recording</label>
              <input
                type="checkbox"
                checked={preferences.default_call_recording}
                onChange={(e) => setPreferences({ ...preferences, default_call_recording: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button onClick={handleSavePreferences} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <ShieldIcon />
            <h2 className="text-xl font-semibold text-gray-900">Security</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <input
                type="checkbox"
                checked={securitySettings.twoFactorEnabled}
                onChange={(e) => setSecuritySettings({ 
                  ...securitySettings, 
                  twoFactorEnabled: e.target.checked 
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <select
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings({ 
                  ...securitySettings, 
                  sessionTimeout: parseInt(e.target.value, 10) 
                })}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="480">8 hours</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <Button onClick={handleSaveSecurity} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Security Settings'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
