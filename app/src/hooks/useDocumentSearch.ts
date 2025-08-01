import { useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

// Types for search functionality
export interface SearchResult {
  id: string
  content: string
  similarity: number
  document_id: string
  document_name: string
  chunk_index?: number
  metadata?: any
}

export interface SearchResponse {
  success: boolean
  query: string
  results: SearchResult[]
  total_results: number
  processing_time: number
  search_type: string
  error?: {
    code: string
    message: string
    details?: any
    timestamp?: string
  }
}

export interface SearchOptions {
  similarity_threshold?: number
  match_count?: number
  search_type?: 'chunks' | 'documents' | 'both'
}

export interface UseDocumentSearchReturn {
  search: (query: string, options?: SearchOptions) => Promise<void>
  results: SearchResult[]
  loading: boolean
  error: string | null
  lastQuery: string
  searchStats: {
    totalResults: number
    processingTime: number
    searchType: string
  } | null
  clearResults: () => void
  clearError: () => void
}

/**
 * Custom hook for document search functionality
 * Integrates with the retrieve-similar-chunks Edge Function
 */
export const useDocumentSearch = (): UseDocumentSearchReturn => {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastQuery, setLastQuery] = useState('')
  const [searchStats, setSearchStats] = useState<{
    totalResults: number
    processingTime: number
    searchType: string
  } | null>(null)

  // Get Supabase client from environment or context
  const getSupabaseClient = useCallback(() => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing. Please check your environment variables.')
    }
    
    return createClient(supabaseUrl, supabaseKey)
  }, [])

  const search = useCallback(async (query: string, options: SearchOptions = {}) => {
    if (!query.trim()) {
      setError('Please enter a search query')
      return
    }

    setLoading(true)
    setError(null)
    setLastQuery(query)

    try {
      const supabase = getSupabaseClient()
      
      // Prepare search payload
      const searchPayload = {
        query: query.trim(),
        similarity_threshold: options.similarity_threshold || 0.7,
        match_count: options.match_count || 10,
        search_type: options.search_type || 'chunks'
      }

      console.log('🔍 Searching with payload:', searchPayload)

      // Call the retrieve-similar-chunks Edge Function
      const { data, error: edgeFunctionError } = await supabase.functions.invoke(
        'retrieve-similar-chunks',
        {
          body: searchPayload
        }
      )

      if (edgeFunctionError) {
        console.error('Edge Function Error:', edgeFunctionError)
        throw new Error(`Search failed: ${edgeFunctionError.message || 'Unknown error'}`)
      }

      const searchResponse: SearchResponse = data
      
      if (!searchResponse.success) {
        const errorMessage = searchResponse.error?.message || 'Search failed'
        console.error('Search Response Error:', searchResponse.error)
        throw new Error(errorMessage)
      }

      // Update state with results
      setResults(searchResponse.results)
      setSearchStats({
        totalResults: searchResponse.total_results,
        processingTime: searchResponse.processing_time,
        searchType: searchResponse.search_type
      })

      console.log(`✅ Search completed: ${searchResponse.total_results} results in ${searchResponse.processing_time}ms`)

    } catch (err) {
      console.error('Search error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      setResults([])
      setSearchStats(null)
    } finally {
      setLoading(false)
    }
  }, [getSupabaseClient])

  const clearResults = useCallback(() => {
    setResults([])
    setSearchStats(null)
    setLastQuery('')
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    search,
    results,
    loading,
    error,
    lastQuery,
    searchStats,
    clearResults,
    clearError
  }
}

/**
 * Hook for advanced search with filtering and sorting
 */
export const useAdvancedDocumentSearch = () => {
  const baseSearch = useDocumentSearch()
  const [filters, setFilters] = useState({
    minSimilarity: 0.7,
    documentTypes: [] as string[],
    dateRange: null as { start: Date; end: Date } | null
  })
  const [sortBy, setSortBy] = useState<'similarity' | 'date' | 'name'>('similarity')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredAndSortedResults = useCallback(() => {
    let filtered = baseSearch.results.filter(result => {
      // Filter by minimum similarity
      if (result.similarity < filters.minSimilarity) {
        return false
      }

      // Filter by document types
      if (filters.documentTypes.length > 0) {
        const fileExtension = result.metadata?.file_extension?.toLowerCase()
        if (!fileExtension || !filters.documentTypes.includes(fileExtension)) {
          return false
        }
      }

      // Filter by date range
      if (filters.dateRange) {
        const createdAt = new Date(result.metadata?.created_at)
        if (createdAt < filters.dateRange.start || createdAt > filters.dateRange.end) {
          return false
        }
      }

      return true
    })

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'similarity':
          comparison = a.similarity - b.similarity
          break
        case 'name':
          comparison = a.document_name.localeCompare(b.document_name)
          break
        case 'date':
          const dateA = new Date(a.metadata?.created_at || 0)
          const dateB = new Date(b.metadata?.created_at || 0)
          comparison = dateA.getTime() - dateB.getTime()
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [baseSearch.results, filters, sortBy, sortOrder])

  return {
    ...baseSearch,
    results: filteredAndSortedResults(),
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  }
}

/**
 * Utility function to highlight search terms in content
 */
export const highlightSearchTerms = (content: string, searchQuery: string): string => {
  if (!searchQuery.trim()) return content
  
  const terms = searchQuery.trim().split(/\s+/)
  let highlightedContent = content
  
  terms.forEach(term => {
    if (term.length > 2) { // Only highlight terms longer than 2 characters
      const regex = new RegExp(`(${term})`, 'gi')
      highlightedContent = highlightedContent.replace(regex, '<mark class="search-highlight">$1</mark>')
    }
  })
  
  return highlightedContent
}

/**
 * Utility function to truncate content for display
 */
export const truncateContent = (content: string, maxLength: number = 200): string => {
  if (content.length <= maxLength) return content
  
  const truncated = content.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return lastSpace > maxLength * 0.7 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...'
}

/**
 * Utility function to format similarity score
 */
export const formatSimilarity = (similarity: number): string => {
  return `${Math.round(similarity * 100)}%`
}

/**
 * Utility function to get similarity color based on score
 */
export const getSimilarityColor = (similarity: number): string => {
  if (similarity >= 0.9) return '#22c55e' // green
  if (similarity >= 0.8) return '#84cc16' // lime
  if (similarity >= 0.7) return '#eab308' // yellow
  if (similarity >= 0.6) return '#f97316' // orange
  return '#ef4444' // red
}
