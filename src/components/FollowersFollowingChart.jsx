import React from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CustomTooltip } from './CustomTooltip'

export default function FollowersFollowingChart({ profile, isDarkMode }) {
  if (!profile) {
    return null
  }

  const data = [
    {
      name: 'Followers',
      value: profile.followers,
      color: isDarkMode ? '#10b981' : '#059669',
    },
    {
      name: 'Following',
      value: profile.following,
      color: isDarkMode ? '#3b82f6' : '#2563eb',
    },
  ]

  const maxValue = Math.max(profile.followers, profile.following, 1)
  const ratio = profile.followers > 0 ? (profile.following / profile.followers).toFixed(2) : 'N/A'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
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
        👥 Followers & Following
      </motion.h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          className={`p-4 rounded-lg ${
            isDarkMode
              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30'
              : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200'
          }`}
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className={`text-sm font-medium mb-2 ${
              isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
            }`}
          >
            Followers
          </div>
          <motion.div
            className={`text-3xl font-bold ${
              isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
          >
            {profile.followers.toLocaleString()}
          </motion.div>
        </motion.div>

        <motion.div
          className={`p-4 rounded-lg ${
            isDarkMode
              ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30'
              : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'
          }`}
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className={`text-sm font-medium mb-2 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-700'
            }`}
          >
            Following
          </div>
          <motion.div
            className={`text-3xl font-bold ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
          >
            {profile.following.toLocaleString()}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className={`w-full h-64 ${isDarkMode ? 'recharts-wrapper-dark' : 'recharts-wrapper-light'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            style={{ backgroundColor: 'transparent' }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDarkMode ? '#334155' : '#e5e7eb'}
              opacity={0.3}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: isDarkMode ? '#e5e7eb' : '#1f2937' }}
              style={{ fontSize: '14px', fontWeight: 'bold' }}
            />
            <YAxis
              tick={{ fill: isDarkMode ? '#e5e7eb' : '#1f2937' }}
              style={{ fontSize: '12px' }}
              domain={[0, maxValue * 1.1]}
            />
            <Tooltip
              content={<CustomTooltip isDarkMode={isDarkMode} />}
              cursor={{
                fill: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                stroke: isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                strokeWidth: 1,
              }}
            />
            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
              animationBegin={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        className={`mt-4 p-3 rounded-lg text-center ${
          isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div
          className={`text-sm font-medium ${
            isDarkMode ? 'text-slate-300' : 'text-gray-700'
          }`}
        >
          Following/Followers Ratio:{' '}
          <span
            className={`font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {ratio}
          </span>
        </div>
        <div
          className={`text-xs mt-1 ${
            isDarkMode ? 'text-slate-400' : 'text-gray-600'
          }`}
        >
          {ratio !== 'N/A' && parseFloat(ratio) > 1
            ? 'You follow more people than follow you'
            : ratio !== 'N/A' && parseFloat(ratio) < 1
            ? 'More people follow you than you follow'
            : ratio !== 'N/A' && parseFloat(ratio) === 1
            ? 'Perfect balance!'
            : ''}
        </div>
      </motion.div>
    </motion.div>
  )
}

