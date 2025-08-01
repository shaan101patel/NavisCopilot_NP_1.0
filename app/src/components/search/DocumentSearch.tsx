import React, { useState, useEffect } from 'react'
import { Search, Filter, Clock, FileText, Hash, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { 
  useDocumentSearch, 
  SearchResult, 
  SearchOptions,
  highlightSearchTerms,
  truncateContent,
  formatSimilarity,
  getSimilarityColor
} from '../../hooks/useDocumentSearch'

interface DocumentSearchProps {
  className?: string
  placeholder?: string
  defaultSearchType?: 'chunks' | 'documents' | 'both'
  onResultClick?: (result: SearchResult) => void
}

export const DocumentSearch: React.FC<DocumentSearchProps> = ({
  className = '',
  placeholder = 'Search documents and knowledge base...',
  defaultSearchType = 'chunks',
  onResultClick
}) => {
  const [query, setQuery] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    similarity_threshold: 0.7,
    match_count: 10,
    search_type: defaultSearchType
  })
  
  const {
    search,
    results,
    loading,
    error,
    lastQuery,
    searchStats,
    clearResults,
    clearError
  } = useDocumentSearch()

  // Handle search submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    clearError()
    await search(query, searchOptions)
  }

  // Handle Enter key in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch(e as any)
    }
  }

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Search Input Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <form onSubmit={handleSearch} className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={loading}
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5 animate-spin" />
            )}
          </div>
          
          {/* Advanced Options Toggle */}
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <Filter className="h-4 w-4 mr-1" />
              Advanced Options
              <span className={`ml-1 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearResults}
                className="text-sm text-gray-500 hover:text-gray-700"
                disabled={loading || results.length === 0}
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Advanced Options Panel */}
          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Type
                  </label>
                  <select
                    value={searchOptions.search_type}
                    onChange={(e) => setSearchOptions(prev => ({ 
                      ...prev, 
                      search_type: e.target.value as 'chunks' | 'documents' | 'both' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="chunks">Document Chunks</option>
                    <option value="documents">Full Documents</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Similarity Threshold
                  </label>
                  <select
                    value={searchOptions.similarity_threshold}
                    onChange={(e) => setSearchOptions(prev => ({ 
                      ...prev, 
                      similarity_threshold: parseFloat(e.target.value) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value={0.9}>Very High (90%)</option>
                    <option value={0.8}>High (80%)</option>
                    <option value={0.7}>Medium (70%)</option>
                    <option value={0.6}>Low (60%)</option>
                    <option value={0.5}>Very Low (50%)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Results
                  </label>
                  <select
                    value={searchOptions.match_count}
                    onChange={(e) => setSearchOptions(prev => ({ 
                      ...prev, 
                      match_count: parseInt(e.target.value) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value={5}>5 results</option>
                    <option value={10}>10 results</option>
                    <option value={20}>20 results</option>
                    <option value={50}>50 results</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Search Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600 ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Stats */}
      {searchStats && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-blue-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Found {searchStats.totalResults} results for "{lastQuery}"
            </div>
            <div className="flex items-center text-blue-600 space-x-4">
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {searchStats.processingTime}ms
              </span>
              <span className="text-xs bg-blue-200 px-2 py-1 rounded">
                {searchStats.searchType}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mt-4 space-y-3">
          {results.map((result, index) => (
            <SearchResultCard
              key={`${result.id}-${index}`}
              result={result}
              query={lastQuery}
              onClick={() => onResultClick?.(result)}
            />
          ))}
        </div>
      )}

      {/* No Results Message */}
      {!loading && lastQuery && results.length === 0 && !error && (
        <div className="mt-8 text-center py-8">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Try adjusting your search terms, reducing the similarity threshold, or searching for broader topics.
          </p>
        </div>
      )}
    </div>
  )
}

// Individual Search Result Card Component
interface SearchResultCardProps {
  result: SearchResult
  query: string
  onClick?: () => void
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ result, query, onClick }) => {
  const similarityColor = getSimilarityColor(result.similarity)
  
  return (
    <div 
      className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
        onClick ? 'hover:border-blue-300' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <h3 className="font-medium text-gray-900 truncate">{result.document_name}</h3>
          {result.chunk_index !== undefined && (
            <span className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              <Hash className="h-3 w-3 mr-1" />
              Chunk {result.chunk_index + 1}
            </span>
          )}
        </div>
        <div 
          className="text-xs font-medium px-2 py-1 rounded"
          style={{ 
            backgroundColor: `${similarityColor}20`, 
            color: similarityColor 
          }}
        >
          {formatSimilarity(result.similarity)} match
        </div>
      </div>

      {/* Content Preview */}
      <div className="text-sm text-gray-700 leading-relaxed">
        <div 
          dangerouslySetInnerHTML={{ 
            __html: highlightSearchTerms(truncateContent(result.content, 300), query) 
          }}
        />
      </div>

      {/* Metadata */}
      {result.metadata && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            {result.metadata.file_extension && (
              <span className="uppercase font-medium">{result.metadata.file_extension}</span>
            )}
            {result.metadata.content_length && (
              <span>{result.metadata.content_length} chars</span>
            )}
            {result.metadata.created_at && (
              <span>{new Date(result.metadata.created_at).toLocaleDateString()}</span>
            )}
          </div>
          <span className="text-gray-400">ID: {result.document_id.slice(0, 8)}...</span>
        </div>
      )}
    </div>
  )
}

export default DocumentSearch
