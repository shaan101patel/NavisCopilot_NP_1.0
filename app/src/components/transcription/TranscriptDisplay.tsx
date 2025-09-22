import React, { useState } from 'react';
import { TranscriptSegment } from '../../types/transcript';
import { TranscriptSegmentComponent } from './TranscriptSegment';

export const TranscriptDisplay: React.FC<{
  segments: TranscriptSegment[];
  isProcessing: boolean;
  wordCount: number;
  averageConfidence: number;
  onClearTranscript?: () => void;
}> = ({ segments, isProcessing, wordCount, averageConfidence, onClearTranscript }) => {
  const [copiedSegmentId, setCopiedSegmentId] = useState<string | null>(null);
  const handleCopySegment = (segmentId: string) => { setCopiedSegmentId(segmentId); setTimeout(() => setCopiedSegmentId(null), 2000); };
  const handleCopyAll = () => {
    const fullText = segments.filter(s => !s.isProcessing).map(s => s.text).join(' ');
    navigator.clipboard.writeText(fullText);
    setCopiedSegmentId('all');
    setTimeout(() => setCopiedSegmentId(null), 2000);
  };
  const avgColor = averageConfidence >= 0.8 ? 'text-green-600' : averageConfidence >= 0.6 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Transcript</h2>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <span>Words: {wordCount}</span>
              <span>Segments: {segments.filter(s => !s.isProcessing).length}</span>
              {segments.length > 0 && (
                <span className={avgColor}>Avg. Confidence: {Math.round(averageConfidence * 100)}%</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {segments.length > 0 && (
              <button onClick={handleCopyAll} className="btn-secondary text-sm flex items-center space-x-1" title="Copy all transcript text">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{copiedSegmentId === 'all' ? 'Copied!' : 'Copy All'}</span>
              </button>
            )}
            {onClearTranscript && segments.length > 0 && (
              <button onClick={onClearTranscript} className="text-red-600 hover:text-red-800 text-sm font-medium">Clear</button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {segments.length === 0 && !isProcessing ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h8V6H6z M9 8v8 M15 8v8" />
            </svg>
            <p className="text-gray-500 text-sm">No transcript yet</p>
            <p className="text-gray-400 text-xs mt-1">Start recording to see transcript appear here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {segments.map((segment) => (
              <TranscriptSegmentComponent key={segment.id} segment={segment} onCopy={() => handleCopySegment(segment.id)} />
            ))}
          </div>
        )}
        {isProcessing && segments.length === 0 && (
          <div className="text-center py-8">
            <svg className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600 text-sm">Processing audio...</p>
          </div>
        )}
      </div>

      {copiedSegmentId && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-200">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Copied to clipboard!</span>
          </div>
        </div>
      )}
    </div>
  );
};
