import React, { useState, useEffect } from 'react'
import RepoCard from './components/RepoCard'

function App() {
  const [username, setUsername] = useState('')
  const [token, setToken] = useState('')
  const [profile, setProfile] = useState(null)
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalStars, setTotalStars] = useState(0)
  const [totalForks, setTotalForks] = useState(0)
  const [languages, setLanguages] = useState({})

  useEffect(() => {
    const savedToken = localStorage.getItem('github_token')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  useEffect(() => {
    if (token) {
      localStorage.setItem('github_token', token)
    }
  }, [token])

  const humanNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  const fetchProfile = async (username, token) => {
    const headers = token ? { Authorization: `token ${token}` } : {}
    const response = await fetch(`https://api.github.com/users/${username}`, { headers })
    if (!response.ok) {
      throw new Error(response.status === 404 ? 'User not found' : 'Failed to fetch profile')
    }
    return response.json()
  }

  const fetchRepos = async (username, token) => {
    const headers = token ? { Authorization: `token ${token}` } : {}
    const repos = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=updated`,
        { headers }
      )
      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }
      const data = await response.json()
      repos.push(...data)
      hasMore = data.length === 100
      page++
    }

    return repos
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    setLoading(true)
    setError('')
    setProfile(null)
    setRepos([])

    try {
      const [profileData, reposData] = await Promise.all([
        fetchProfile(username, token),
        fetchRepos(username, token)
      ])

      setProfile(profileData)
      setRepos(reposData)

      // Calculate totals
      const stars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0)
      const forks = reposData.reduce((sum, repo) => sum + repo.forks_count, 0)
      setTotalStars(stars)
      setTotalForks(forks)

      // Count languages
      const langCount = {}
      reposData.forEach(repo => {
        if (repo.language) {
          langCount[repo.language] = (langCount[repo.language] || 0) + 1
        }
      })
      setLanguages(langCount)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">GitHub Repo Stats Viewer</h1>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="col-span-1 md:col-span-2 p-2 rounded bg-slate-800 border border-slate-700"
              placeholder="Enter GitHub username"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500"
            >
              Fetch
            </button>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={token}
              onChange={e => setToken(e.target.value)}
              className="col-span-1 md:col-span-2 p-2 rounded bg-slate-800 border border-slate-700"
              placeholder="Optional: Personal Access Token (for higher rate limits)"
            />
            <div className="p-2 text-sm text-slate-400">
              Your PAT is stored in your browser's localStorage only.
            </div>
          </div>
        </form>

        {error && (
          <div className="bg-rose-700 text-white p-3 rounded mb-4">
            Error: {error}
          </div>
        )}

        {loading && (
          <div className="p-4 text-slate-300">Loading... please wait.</div>
        )}

        {profile && (
          <section className="bg-slate-800 p-4 rounded mb-6">
            <div className="flex items-center gap-4">
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="w-20 h-20 rounded"
              />
              <div>
                <div className="text-lg font-medium">
                  {profile.name || profile.login}
                </div>
                <div className="text-slate-400">{profile.bio}</div>
                <div className="mt-2 text-sm text-slate-300">
                  {profile.followers} followers · {profile.following} following ·{' '}
                  {profile.public_repos} repos
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900 rounded">
                <div className="text-xs text-slate-400">Total Stars</div>
                <div className="text-xl font-semibold">{humanNumber(totalStars)}</div>
              </div>
              <div className="p-3 bg-slate-900 rounded">
                <div className="text-xs text-slate-400">Total Forks</div>
                <div className="text-xl font-semibold">{humanNumber(totalForks)}</div>
              </div>
              <div className="p-3 bg-slate-900 rounded">
                <div className="text-xs text-slate-400">Top Languages</div>
                <div className="text-sm">
                  {Object.keys(languages).slice(0, 3).join(', ') || '—'}
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-medium mb-2">Repositories</h2>
          {repos.length === 0 && !loading && (
            <div className="text-slate-400">No repos to show.</div>
          )}
          <div className="grid gap-3">
            {repos.map(repo => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        </section>

        <footer className="mt-8 text-slate-500 text-sm">
          Built with ❤️ · Client-side only · Provide PAT if you get rate-limited
        </footer>
      </div>
    </div>
  )
}

export default App