import React from 'react'
import { motion } from 'framer-motion'

const RepoCard = React.memo(function RepoCard({ repo, isDarkMode, index = 0 }) {
  return (
    <motion.a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`block p-5 rounded-lg transition-all duration-300 cursor-pointer ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-700 hover:border-slate-600 shadow-lg hover:shadow-xl'
          : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg'
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <motion.div
            className={`font-semibold text-lg mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {repo.name}
          </motion.div>
          <motion.div
            className={`text-sm mb-3 line-clamp-2 ${
              isDarkMode ? 'text-slate-400' : 'text-gray-600'
            }`}
            initial={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
          >
            {repo.description || 'No description'}
          </motion.div>
        </div>
        {repo.language && (
          <motion.div
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              isDarkMode
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {repo.language}
          </motion.div>
        )}
      </div>
      <motion.div
        className={`mt-4 flex gap-4 text-xs ${
          isDarkMode ? 'text-slate-400' : 'text-gray-500'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          className="flex items-center gap-1"
          whileHover={{ scale: 1.1, color: isDarkMode ? '#fbbf24' : '#f59e0b' }}
        >
          <span>⭐</span>
          <span className="font-medium">{repo.stargazers_count}</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1"
          whileHover={{ scale: 1.1, color: isDarkMode ? '#34d399' : '#10b981' }}
        >
          <span>🍴</span>
          <span className="font-medium">{repo.forks_count}</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1"
          whileHover={{ scale: 1.1 }}
        >
          <span>🔁</span>
          <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
        </motion.div>
      </motion.div>
    </motion.a>
  )
})

export default RepoCard
