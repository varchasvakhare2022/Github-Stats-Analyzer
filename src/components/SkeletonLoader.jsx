import React from 'react'
import { motion } from 'framer-motion'

export default function SkeletonLoader({ isDarkMode }) {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-lg ${
          isDarkMode ? 'bg-slate-800' : 'bg-white border border-gray-200'
        }`}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className={`w-20 h-20 rounded-full ${
              isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
            }`}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <div className="flex-1 space-y-2">
            <motion.div
              className={`h-6 rounded ${
                isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
              }`}
              style={{ width: '200px' }}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2,
              }}
            />
            <motion.div
              className={`h-4 rounded ${
                isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
              }`}
              style={{ width: '300px' }}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.4,
              }}
            />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-slate-800' : 'bg-white border border-gray-200'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <motion.div
              className={`h-4 rounded mb-2 ${
                isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
              }`}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            />
            <motion.div
              className={`h-8 rounded ${
                isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
              }`}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2 + 0.1,
              }}
            />
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-slate-800' : 'bg-white border border-gray-200'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-2">
                <motion.div
                  className={`h-5 rounded ${
                    isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
                  }`}
                  style={{ width: '250px' }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.1,
                  }}
                />
                <motion.div
                  className={`h-4 rounded ${
                    isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
                  }`}
                  style={{ width: '400px' }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.1 + 0.2,
                  }}
                />
              </div>
              <motion.div
                className={`h-4 w-16 rounded ${
                  isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
                }`}
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.1 + 0.3,
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

