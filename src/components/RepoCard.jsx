import React from 'react'

export default function RepoCard({ repo, isDarkMode }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      className={`block p-4 rounded hover:scale-[1.01] transition ${
        isDarkMode
          ? 'bg-slate-800 hover:bg-slate-700'
          : 'bg-white hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {repo.name}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {repo.description || 'No description'}
          </div>
        </div>
        <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          {repo.language || '—'}
        </div>
      </div>
      <div className={`mt-3 flex gap-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
        <div>⭐ {repo.stargazers_count}</div>
        <div>🍴 {repo.forks_count}</div>
        <div>🔁 Updated {new Date(repo.updated_at).toLocaleDateString()}</div>
      </div>
    </a>
  )
}
