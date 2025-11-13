import React, { useState, useEffect } from 'react'

export default function RateLimitStatus({ token, isDarkMode = true }) {
  const [rateLimit, setRateLimit] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRateLimit = async () => {
      try {
        // First try with token if provided
        let headers = token ? { Authorization: `token ${token}` } : {}
        let response = await fetch('https://api.github.com/rate_limit', { headers })
        
        // If unauthorized with token, try without token
        if (response.status === 401 && token) {
          headers = {}
          response = await fetch('https://api.github.com/rate_limit', { headers })
        }
        
        if (!response.ok) {
          // Silently fail - don't show rate limit if we can't fetch it
          setRateLimit(null)
          setLoading(false)
          return
        }

        const data = await response.json()
        
        // Validate the data structure before using it
        if (data && data.resources && data.resources.core) {
          setRateLimit(data.resources.core)
          setLoading(false)
        } else {
          setRateLimit(null)
          setLoading(false)
        }
      } catch (error) {
        // Silently fail on network errors
        console.error('Failed to fetch rate limit:', error)
        setRateLimit(null)
        setLoading(false)
      }
    }

    fetchRateLimit()
    const interval = setInterval(fetchRateLimit, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [token])

  // Don't render anything while loading or if no data
  if (loading) {
    return null
  }

  if (!rateLimit) {
    return null
  }

  // Now rateLimit is directly the core object
  const { remaining, limit, reset } = rateLimit
  const percentage = (remaining / limit) * 100
  const resetDate = new Date(reset * 1000)
  const timeUntilReset = Math.max(0, Math.floor((reset * 1000 - Date.now()) / 1000 / 60))

  const getStatusColor = () => {
    if (percentage > 50) return 'bg-emerald-500'
    if (percentage > 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div
      className={`p-4 rounded mb-4 ${
        isDarkMode ? 'bg-slate-800' : 'bg-white border border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}
        >
          Rate Limit Status
        </div>
        <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          {remaining} / {limit} requests remaining
        </div>
      </div>
      <div
        className={`w-full rounded-full h-2 mb-2 ${
          isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
        }`}
      >
        <div
          className={`h-2 rounded-full transition-all ${getStatusColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
        Resets in {timeUntilReset} minutes ({resetDate.toLocaleTimeString()})
      </div>
      {!token && (
        <div className={`text-xs mt-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
          💡 Add a Personal Access Token to increase limit to 5,000/hour
        </div>
      )}
    </div>
  )
}
