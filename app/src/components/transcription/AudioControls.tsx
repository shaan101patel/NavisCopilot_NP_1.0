import React from 'react';
import { formatDuration } from '../../utils/audioFormat';

interface AudioControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  totalDuration: number;
  audioLevel?: number;
  error: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onClearError: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isRecording,
  isPaused,
  totalDuration,
  audioLevel = 0,
  error,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onClearError,
}) => {
  const getRecordButtonText = () => {
    if (isRecording && isPaused) return 'Resume';
    if (isRecording) return 'Pause';
    return 'Start Recording';
  };
  const getRecordButtonAction = () => {
    if (isRecording && isPaused) return onResumeRecording;
    if (isRecording) return onPauseRecording;
    return onStartRecording;
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Audio Controls</h2>
        <div className="text-sm text-gray-500">Duration: {formatDuration(totalDuration)}</div>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-800">{error}</span>
            </div>
            <button onClick={onClearError} className="text-red-500 hover:text-red-700 text-sm font-medium">Dismiss</button>
          </div>
        </div>
      )}
      {isRecording && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-600">Audio Level:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all duration-100" style={{ width: `${Math.min(audioLevel, 100)}%` }} />
            </div>
            <span className="text-sm text-gray-500 w-8">{Math.round(audioLevel)}%</span>
          </div>
        </div>
      )}
      <div className="flex items-center space-x-3">
        <button onClick={getRecordButtonAction()} disabled={!!error} className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${isRecording ? (isPaused ? 'btn-primary' : 'btn-secondary') : 'btn-primary'} ${error ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {isRecording && !isPaused ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
          <span>{getRecordButtonText()}</span>
        </button>
        {isRecording && (
          <button onClick={onStopRecording} className="btn-danger flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            <span>Stop</span>
          </button>
        )}
      </div>
      {isRecording && (
        <div className="mt-4 flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">{isPaused ? 'Recording Paused' : 'Recording...'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
