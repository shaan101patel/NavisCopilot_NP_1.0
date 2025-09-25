import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { setUser } from '@/store/userSlice'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { profileAPI } from '@/services/supabase'
import { useApiKey } from '@/contexts/ApiKeyContext'
import { apiKeyAPI } from '@/services/supabase'
import { Eye, EyeOff, Check, AlertCircle, Shield, KeyRound, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const { apiKeyMasked, save: saveApiKey, remove: removeApiKey, refresh: refreshApiKey } = useApiKey()

  // All hooks must be before any early return!
  const [isLoading, setIsLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    full_name: user?.name || '',
    phone_number: user?.phone_number || '',
  })

  // API Key configuration state (mirror Dashboard)
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [validating, setValidating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const hasStoredApiKey = Boolean(apiKeyMasked && apiKeyMasked.trim().length > 0)

  useEffect(() => {
    // Ensure API key status is fetched when settings loads
    refreshApiKey().catch(() => {})
  }, [refreshApiKey])

  // Delete account modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
          <Card className="p-6">
            <p className="text-gray-500">Please sign in to view your settings.</p>
          </Card>

          {/* Delete Account Section */}
          <Card className="p-6 border-red-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-1 flex items-center gap-2">
                  <Trash2 className="w-5 h-5"/> Delete Account
                </h2>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
                Delete Account
              </Button>
            </div>
          </Card>

          {/* Delete Account Modal */}
          {deleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-lg bg-card border border-border rounded-lg p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-500"/> Delete Account Request
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  To delete your account, please send an email to{' '}
                  <a
                    className="text-primary underline"
                    href={`mailto:ais.ringrang@gmail.com?subject=${encodeURIComponent('Account Deletion Request')}&body=${encodeURIComponent('Please delete my account.\n\nAccount Name: \nReason (optional): ')}`}
                  >
                    ais.ringrang@gmail.com
                  </a>.
                  Include your account name and an optional reason for deletion.
                </p>
                <div className="bg-muted/50 rounded-md p-3 text-sm text-muted-foreground mb-4">
                  <div><span className="font-medium text-foreground">Account Name:</span> —</div>
                  <div><span className="font-medium text-foreground">Email:</span> —</div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Close</Button>
                  <Button
                    onClick={() => {
                      const subject = 'Account Deletion Request';
                      const body = `Please delete my account.%0A%0AAccount Name: %0AReason (optional): `;
                      window.location.href = `mailto:ais.ringrang@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
                    }}
                    variant="destructive"
                  >
                    Open Email Client
                  </Button>
                </div>
              </div>
            </div>
          )}
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

        {/* API Key Configuration Section (same as Dashboard) */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Section Header */}
            <div>
              <h2 className="text-xl md:text-2xl font-heading text-foreground mb-2 flex items-center gap-2"><KeyRound size={20}/> API Key Configuration</h2>
              <p className="text-muted-foreground">
                Store your transcription API key securely. It’s encrypted at rest and only visible to you.
              </p>
            </div>

            {/* Current Key Status */}
            <div
              className={cn(
                'p-4 rounded-lg border flex items-center justify-between transition-colors',
                hasStoredApiKey
                  ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800'
                  : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
              )}
            >
              <div>
                <h3 className="font-medium text-foreground mb-1">Current API Key</h3>
                <p className="font-mono text-primary text-sm" aria-live="polite">{apiKeyMasked || '— Not configured —'}</p>
                <p className="text-xs text-muted-foreground mt-1">Stored encrypted. Only a masked preview is shown.</p>
              </div>
              <Shield size={18} className="text-muted-foreground" aria-hidden="true"/>
            </div>

            {/* Update Key */}
            <div className="space-y-3">
              <label htmlFor="api-key" className="block text-sm font-medium text-foreground">Enter API Key</label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="gsk_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  aria-describedby="api-key-help"
                />
                <Button variant="outline" onClick={() => setShowApiKey(v => !v)} aria-label={showApiKey ? 'Hide API key' : 'Show API key'}>
                  {showApiKey ? <EyeOff size={16}/> : <Eye size={16}/>} 
                </Button>
              </div>
              <p id="api-key-help" className="text-xs text-muted-foreground">The key will be validated before saving and stored encrypted.</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Button
                onClick={async () => {
                  try {
                    setStatusMessage(null); setValidating(true);
                    const data = await apiKeyAPI.validate(apiKey);
                    if (!data.valid) { setStatusMessage({ type: 'error', text: data.error || 'API key is invalid' }); }
                    else { setStatusMessage({ type: 'success', text: 'API key looks valid' }); }
                  } catch (e: any) {
                    setStatusMessage({ type: 'error', text: e.message || 'Validation failed' });
                  } finally { setValidating(false); }
                }}
                variant="outline"
                disabled={!apiKey}
              >
                {validating ? 'Validating…' : 'Validate'}
              </Button>

              <Button
                onClick={async () => {
                  try {
                    setSaving(true); setStatusMessage(null);
                    await saveApiKey(apiKey);
                    await refreshApiKey();
                    setStatusMessage({ type: 'success', text: 'API key saved' });
                    setApiKey('');
                  } catch (e: any) {
                    setStatusMessage({ type: 'error', text: e.message || 'Failed to save API key' });
                  } finally { setSaving(false); }
                }}
                disabled={!apiKey}
                className="flex items-center gap-2"
              >
                <Check size={16}/> {saving ? 'Saving…' : 'Save API Key'}
              </Button>

              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    setDeleting(true); setStatusMessage(null);
                    await removeApiKey();
                    await refreshApiKey();
                    setStatusMessage({ type: 'success', text: 'API key removed' });
                  } catch (e: any) {
                    setStatusMessage({ type: 'error', text: e.message || 'Failed to delete API key' });
                  } finally { setDeleting(false); }
                }}
              >
                {deleting ? 'Removing…' : 'Delete API Key'}
              </Button>
            </div>

            {statusMessage && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                statusMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {statusMessage.type === 'success' ? <Check size={16}/> : <AlertCircle size={16}/>} 
                <span className="text-sm font-medium">{statusMessage.text}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Delete Account Section */}
        <Card className="p-6 border-red-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-1 flex items-center gap-2">
                <Trash2 className="w-5 h-5"/> Delete Account
              </h2>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
              Delete Account
            </Button>
          </div>
        </Card>

        {/* Delete Account Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg bg-card border border-border rounded-lg p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500"/> Delete Account Request
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                To delete your account, please send an email to{' '}
                <a
                  className="text-primary underline"
                  href={`mailto:ais.ringrang@gmail.com?subject=${encodeURIComponent('Account Deletion Request')}&body=${encodeURIComponent('Please delete my account.\n\nAccount Name: ' + (user.name || '') + '\nReason (optional): ')}`}
                >
                  ais.ringrang@gmail.com
                </a>.
                Include your account name and an optional reason for deletion.
              </p>
              <div className="bg-muted/50 rounded-md p-3 text-sm text-muted-foreground mb-4">
                <div><span className="font-medium text-foreground">Account Name:</span> {user.name}</div>
                <div><span className="font-medium text-foreground">Email:</span> {user.email}</div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Close</Button>
                <Button
                  onClick={() => {
                    const subject = 'Account Deletion Request';
                    const body = `Please delete my account.%0A%0AAccount Name: ${encodeURIComponent(user.name || '')}%0AReason (optional): `;
                    window.location.href = `mailto:ais.ringrang@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
                  }}
                  variant="destructive"
                >
                  Open Email Client
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications, Preferences and Security sections removed */}
      </div>
    </div>
  )
}
