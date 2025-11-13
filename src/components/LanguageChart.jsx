import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
]

export default function LanguageChart({ languages, isDarkMode }) {
  const data = Object.entries(languages)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  if (data.length === 0) {
    return (
      <div className="text-center text-slate-400 dark:text-slate-500 py-8">
        No language data available
      </div>
    )
  }

  const renderCustomLabel = ({ name, percent }) => {
    if (percent < 0.05) return null
    return `${(percent * 100).toFixed(0)}%`
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              borderRadius: '8px',
              color: isDarkMode ? '#f1f5f9' : '#0f172a',
            }}
          />
          <Legend
            wrapperStyle={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

