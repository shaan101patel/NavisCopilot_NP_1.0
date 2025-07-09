/**
 * ConnectAudioModal Component
 * 
 * Modal for connecting audio via screen sharing or phone system.
 * Features dual-mode interface with live connection status and controls.
 */

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  X, Monitor, Phone, Share, AlertCircle, PhoneCall, PhoneOff, 
  Mic, MicOff, Volume2, Pause, Grid3X3 
} from "lucide-react";

interface ConnectAudioModalProps {
  show: boolean;
  onClose: () => void;
}

type AudioConnectionMode = 'share-screen' | 'mock-phone';

interface MockPhoneState {
  selectedPhoneNumber: string;
  isConnected: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isOnHold: boolean;
  showKeypad: boolean;
}

// Mock phone numbers for demo
const mockAgentPhoneNumbers = [
  { id: 'phone-1', number: '+1 (555) 123-4567', label: 'Primary Line', isPrimary: true },
  { id: 'phone-2', number: '+1 (555) 987-6543', label: 'Secondary Line', isPrimary: false },
  { id: 'phone-3', number: '+1 (555) 555-0123', label: 'Direct Line', isPrimary: false }
];

export const ConnectAudioModal: React.FC<ConnectAudioModalProps> = ({
  show,
  onClose
}) => {
  const [audioConnectionMode, setAudioConnectionMode] = useState<AudioConnectionMode>('share-screen');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);
  const [callDuration] = useState('03:24'); // Mock call duration
  
  const [mockPhoneState, setMockPhoneState] = useState<MockPhoneState>({
    selectedPhoneNumber: '',
    isConnected: false,
    isMuted: false,
    isSpeakerOn: false,
    isOnHold: false,
    showKeypad: false
  });

  if (!show) return null;

  const startScreenShare = async () => {
    try {
      setScreenShareError(null);
      // Mock screen sharing implementation
      // In real implementation, use navigator.mediaDevices.getDisplayMedia()
      setIsScreenSharing(true);
    } catch (error) {
      setScreenShareError('Failed to start screen sharing. Please check your browser permissions.');
    }
  };

  const stopScreenShare = () => {
    setIsScreenSharing(false);
    setScreenShareError(null);
  };

  const handleConnectMockPhone = () => {
    if (!mockPhoneState.selectedPhoneNumber) return;
    
    setMockPhoneState(prev => ({
      ...prev,
      isConnected: !prev.isConnected
    }));
  };

  const handleMockPhoneAction = (action: string) => {
    switch (action) {
      case 'mute':
        setMockPhoneState(prev => ({ ...prev, isMuted: !prev.isMuted }));
        break;
      case 'speaker':
        setMockPhoneState(prev => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
        break;
      case 'hold':
        setMockPhoneState(prev => ({ ...prev, isOnHold: !prev.isOnHold }));
        break;
      case 'keypad':
        setMockPhoneState(prev => ({ ...prev, showKeypad: !prev.showKeypad }));
        break;
    }
  };

  const handleKeypadPress = (digit: string) => {
    // Mock keypad press
    console.log('Keypad pressed:', digit);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Connect Audio</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            aria-label="Close connect audio modal"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Mode Selection Tabs */}
        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setAudioConnectionMode('share-screen')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                audioConnectionMode === 'share-screen'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              aria-selected={audioConnectionMode === 'share-screen'}
              role="tab"
            >
              <div className="flex items-center justify-center gap-2">
                <Monitor size={18} />
                Share Screen
              </div>
            </button>
            <button
              onClick={() => setAudioConnectionMode('mock-phone')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                audioConnectionMode === 'mock-phone'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              aria-selected={audioConnectionMode === 'mock-phone'}
              role="tab"
            >
              <div className="flex items-center justify-center gap-2">
                <Phone size={18} />
                Phone
              </div>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {audioConnectionMode === 'share-screen' ? (
            /* Share Screen Content */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Monitor size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Share Your Screen</h3>
                <p className="text-muted-foreground mb-6">
                  Share your screen and audio with Navis for enhanced call assistance and monitoring.
                </p>
              </div>

              {/* Screen Sharing Status */}
              {isScreenSharing ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-green-800 dark:text-green-400">
                      Screen sharing is active
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Navis can see your shared screen and hear audio from your selected source.
                  </p>
                </div>
              ) : screenShareError ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                    <span className="font-medium text-red-800 dark:text-red-400">
                      Screen sharing error
                    </span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {screenShareError}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Notice:</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                    <li>• Audio from the shared source and microphone will be shared with Navis </li>
                    <li>• <strong>Important:</strong> When prompted by your browser, make sure to press the "Also share tab audio" button to enable audio sharing</li>
                  </ul>
                </div>
              )}

              {/* Screen Share Actions */}
              <div className="flex justify-center gap-3">
                {isScreenSharing ? (
                  <Button
                    onClick={stopScreenShare}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Monitor size={18} />
                    Stop Sharing
                  </Button>
                ) : (
                  <Button
                    onClick={startScreenShare}
                    className="flex items-center gap-2"
                  >
                    <Share size={18} />
                    Start Screen Share
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Phone Content */
            <div className="max-w-sm mx-auto">
              {/* Phone Number Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Phone Number
                </label>
                <select
                  value={mockPhoneState.selectedPhoneNumber}
                  onChange={(e) => setMockPhoneState(prev => ({ ...prev, selectedPhoneNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Choose a number...</option>
                  {mockAgentPhoneNumbers.map((phone) => (
                    <option key={phone.id} value={phone.id}>
                      {phone.number} - {phone.label}
                      {phone.isPrimary ? ' (Primary)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mock iPhone-style Interface */}
              <div className="bg-gradient-to-b from-gray-900 to-black text-white rounded-3xl p-6 shadow-2xl">
                {/* Call Status */}
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-400 mb-1">
                    {mockPhoneState.isConnected ? 'Connected' : 'Ready to Connect'}
                  </div>
                  <div className="text-lg font-semibold">
                    {mockPhoneState.selectedPhoneNumber ? 
                      mockAgentPhoneNumbers.find(p => p.id === mockPhoneState.selectedPhoneNumber)?.number || 'Unknown Number'
                      : 'No Number Selected'
                    }
                  </div>
                  <div className="text-sm text-gray-400">
                    {mockPhoneState.isConnected ? callDuration : '00:00'}
                  </div>
                </div>

                {/* Call Control Buttons */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <button
                    onClick={() => handleMockPhoneAction('mute')}
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-colors ${
                      mockPhoneState.isMuted ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    title={mockPhoneState.isMuted ? 'Unmute' : 'Mute'}
                    aria-label={mockPhoneState.isMuted ? 'Unmute microphone' : 'Mute microphone'}
                  >
                    {mockPhoneState.isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                  </button>

                  <button
                    onClick={() => handleMockPhoneAction('keypad')}
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-colors ${
                      mockPhoneState.showKeypad ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    title="Toggle Keypad"
                    aria-label="Toggle numeric keypad"
                  >
                    <Grid3X3 size={24} />
                  </button>

                  <button
                    onClick={() => handleMockPhoneAction('speaker')}
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-colors ${
                      mockPhoneState.isSpeakerOn ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    title={mockPhoneState.isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
                    aria-label={mockPhoneState.isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
                  >
                    <Volume2 size={24} />
                  </button>

                  <div></div> {/* Empty cell */}

                  <button
                    onClick={() => handleMockPhoneAction('hold')}
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-colors ${
                      mockPhoneState.isOnHold ? 'bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    title={mockPhoneState.isOnHold ? 'Resume call' : 'Hold call'}
                    aria-label={mockPhoneState.isOnHold ? 'Resume call' : 'Put call on hold'}
                  >
                    <Pause size={24} />
                  </button>

                  <div></div> {/* Empty cell */}
                </div>

                {/* Numeric Keypad */}
                {mockPhoneState.showKeypad && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                      <button
                        key={digit}
                        onClick={() => handleKeypadPress(digit)}
                        className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-lg font-medium transition-colors mx-auto"
                        aria-label={`Press ${digit}`}
                      >
                        {digit}
                      </button>
                    ))}
                  </div>
                )}

                {/* Connect/Disconnect Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleConnectMockPhone}
                    disabled={!mockPhoneState.selectedPhoneNumber}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                      mockPhoneState.isConnected
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed'
                    }`}
                    title={mockPhoneState.isConnected ? 'Disconnect' : 'Connect'}
                    aria-label={mockPhoneState.isConnected ? 'Disconnect from phone system' : 'Connect to phone system'}
                  >
                    {mockPhoneState.isConnected ? <PhoneOff size={24} /> : <PhoneCall size={24} />}
                  </button>
                </div>
              </div>

              {/* Connection Status */}
              {mockPhoneState.isConnected && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-800 dark:text-green-400">
                      Mock phone connected
                    </span>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Using {mockAgentPhoneNumbers.find(p => p.id === mockPhoneState.selectedPhoneNumber)?.label}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
