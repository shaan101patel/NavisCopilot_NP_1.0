import React from 'react';
import { TranscriptSegment as Segment } from '../../types/transcript';

export const TranscriptSegmentComponent: React.FC<{ segment: Segment; onCopy?: () => void }> = ({ segment, onCopy }) => {
  const formatTimestamp = (timestamp: number) => new Date(timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDuration = (start: number, end: number) => `${Math.round(end - start)}s`;
  const handleCopy = () => { navigator.clipboard.writeText(segment.text); onCopy?.(); };

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 ${segment.isProcessing ? 'bg-yellow-50 border-yellow-200 animate-pulse' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500 font-mono">{formatTimestamp(segment.timestamp)}</span>
          {!segment.isProcessing && (
            <span className="text-xs text-gray-400">{formatDuration(segment.startTime, segment.endTime)}</span>
          )}
        </div>
        {!segment.isProcessing && (
          <button onClick={handleCopy} className="text-gray-400 hover:text-gray-600 transition-colors duration-200" title="Copy text">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        )}
      </div>
      <div className="text-gray-900 leading-relaxed">
        {segment.isProcessing ? (
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600 italic">{segment.text}</span>
          </div>
        ) : (
          <p className={`${segment.confidence < 0.6 ? 'text-gray-600' : 'text-gray-900'}`}>{segment.text}</p>
        )}
      </div>
      {segment.speaker && !segment.isProcessing && (
        <div className="mt-2 text-xs text-gray-500">Speaker: {segment.speaker}</div>
      )}
    </div>
  );
};
