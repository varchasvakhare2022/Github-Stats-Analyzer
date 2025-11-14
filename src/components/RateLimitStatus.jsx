import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RateLimitStatus({ token, isDarkMode = true }) {
  const [rateLimit, setRateLimit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tokenInvalid, setTokenInvalid] = useState(false)

  useEffect(() => {
    if (token) {
      setTokenInvalid(false)
    }
  }, [token])

  useEffect(() => {
    const fetchRateLimit = async () => {
      try {
        let headers = {}
        let response
        
        if (token && !tokenInvalid) {
          headers = { Authorization: `token ${token}` }
          response = await fetch('https://api.github.com/rate_limit', { headers })
          
          if (response.status === 401) {
            setTokenInvalid(true)
            headers = {}
            response = await fetch('https://api.github.com/rate_limit', { headers })
          }
        } else {
          response = await fetch('https://api.github.com/rate_limit', { headers })
        }
        
        if (!response.ok) {
          setRateLimit(null)
          setLoading(false)
          return
        }

        const data = await response.json()
        
        if (data && data.resources && data.resources.core) {
          setRateLimit(data.resources.core)
          setLoading(false)
        } else {
          setRateLimit(null)
          setLoading(false)
        }
      } catch (error) {
        setRateLimit(null)
        setLoading(false)
      }
    }

    fetchRateLimit()
    const interval = setInterval(fetchRateLimit, 60000)
    return () => clearInterval(interval)
  }, [token, tokenInvalid])

  if (loading || !rateLimit) {
    return null
  }

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`p-4 rounded-lg mb-4 backdrop-blur-sm ${
          isDarkMode
            ? 'bg-gradient-to-r from-slate-800/90 to-slate-700/90 border border-slate-600 shadow-lg'
            : 'bg-gradient-to-r from-white to-gray-50 border border-gray-200 shadow-md'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <motion.div
            className={`text-sm font-semibold ${
              isDarkMode ? 'text-slate-200' : 'text-gray-900'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            Rate Limit Status
          </motion.div>
          <motion.div
            className={`text-xs font-medium px-2 py-1 rounded ${
              isDarkMode ? 'text-slate-300 bg-slate-700' : 'text-gray-700 bg-gray-100'
            }`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {remaining} / {limit}
          </motion.div>
        </div>
        <div
          className={`w-full rounded-full h-3 mb-2 overflow-hidden ${
            isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
          }`}
        >
          <motion.div
            className={`h-full rounded-full ${getStatusColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <motion.div
          className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Resets in {timeUntilReset} minutes ({resetDate.toLocaleTimeString()})
        </motion.div>
        {(!token || tokenInvalid) && (
          <motion.div
            className={`text-xs mt-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            💡 {tokenInvalid ? 'Invalid token detected. ' : ''}Add a valid Personal Access Token to increase limit to 5,000/hour
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
