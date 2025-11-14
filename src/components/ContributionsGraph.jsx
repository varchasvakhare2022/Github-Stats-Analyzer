import React from 'react'
import { motion } from 'framer-motion'
import GitHubCalendar from 'react-github-calendar'

export default function ContributionsGraph({ username, isDarkMode }) {
  if (!username) {
    return null
  }

  const selectLastYear = (contributions) => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    const shownMonths = 12

    return contributions.filter((activity) => {
      const date = new Date(activity.date)
      const monthOfDay = date.getMonth()

      return (
        date.getFullYear() === currentYear &&
        monthOfDay <= currentMonth &&
        monthOfDay > currentMonth - shownMonths
      )
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`w-full p-6 rounded-xl mb-6 ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700'
          : 'bg-white border border-gray-200 shadow-sm'
      }`}
    >
      <motion.h3
        className={`text-xl font-bold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
        whileHover={{ x: 5 }}
      >
        📅 Contribution Activity
      </motion.h3>
      <motion.div
        className="overflow-x-auto pb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <GitHubCalendar
          username={username}
          blockSize={12}
          blockMargin={4}
          fontSize={12}
          transformData={selectLastYear}
          labels={{
            totalCount: '{{count}} contributions in the last year',
            legend: {
              less: 'Less',
              more: 'More',
            },
          }}
        />
      </motion.div>
      <motion.p
        className={`text-xs mt-4 text-center ${
          isDarkMode ? 'text-slate-400' : 'text-gray-600'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        💡 This shows your GitHub contribution activity for the past year
      </motion.p>
    </motion.div>
  )
}
