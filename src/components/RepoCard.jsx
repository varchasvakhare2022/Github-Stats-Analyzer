import React from 'react'

export default function RepoCard({ repo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      className="block p-4 bg-slate-800 rounded hover:scale-[1.01] transition"
    >
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="font-medium">{repo.name}</div>
          <div className="text-slate-400 text-sm">
            {repo.description || 'No description'}
          </div>
        </div>
        <div className="text-sm text-slate-400">{repo.language || '—'}</div>
      </div>
      <div className="mt-3 flex gap-3 text-xs text-slate-400">
        <div>⭐ {repo.stargazers_count}</div>
        <div>🍴 {repo.forks_count}</div>
        <div>🔁 Updated {new Date(repo.updated_at).toLocaleDateString()}</div>
      </div>
    </a>
  )
}