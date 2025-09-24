import { useState } from 'react'
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

// Removed Bell, Shield and Globe icons along with their sections

export default function Settings() {
  const { user } = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()

  // All hooks must be before any early return!
  const [isLoading, setIsLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    full_name: user?.name || '',
    phone_number: user?.phone_number || '',
  })

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

  // Removed notifications, preferences, and security handlers and loader

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

        {/* Notifications, Preferences and Security sections removed */}
      </div>
    </div>
  )
}
