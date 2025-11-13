import React, { useState, useEffect } from 'react'
import RepoCard from './components/RepoCard'
import RateLimitStatus from './components/RateLimitStatus'
import LanguageChart from './components/LanguageChart'

function App() {
  const [username, setUsername] = useState('')
  const [token, setToken] = useState('')
  const [profile, setProfile] = useState(null)
  const [repos, setRepos] = useState([])
  const [filteredRepos, setFilteredRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalStars, setTotalStars] = useState(0)
  const [totalForks, setTotalForks] = useState(0)
  const [languages, setLanguages] = useState({})
  // Initialize theme from localStorage or default to dark
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      const isDark = savedTheme ? savedTheme === 'dark' : true
      // Apply theme immediately to prevent flash
      document.documentElement.classList.toggle('dark', isDark)
      return isDark
    }
    return true
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [languageFilter, setLanguageFilter] = useState('')
  const [sortBy, setSortBy] = useState('updated')

  // Save theme to localStorage and apply when it changes
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  // Load token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('github_token')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  // Save token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('github_token', token)
    }
  }, [token])

  // Filter and sort repos
  useEffect(() => {
    let filtered = [...repos]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        repo =>
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Language filter
    if (languageFilter) {
      filtered = filtered.filter(repo => repo.language === languageFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stargazers_count - a.stargazers_count
        case 'forks':
          return b.forks_count - a.forks_count
        case 'name':
          return a.name.localeCompare(b.name)
        case 'updated':
        default:
          return new Date(b.updated_at) - new Date(a.updated_at)
      }
    })

    setFilteredRepos(filtered)
  }, [repos, searchQuery, languageFilter, sortBy])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

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
      if (response.status === 404) {
        throw new Error('User not found')
      } else if (response.status === 401) {
        throw new Error('Invalid token. Please remove or update your Personal Access Token.')
      }
      throw new Error('Failed to fetch profile')
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
        if (response.status === 401) {
          throw new Error('Invalid token. Please remove or update your Personal Access Token.')
        }
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
    setFilteredRepos([])
    setSearchQuery('')
    setLanguageFilter('')

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

  // Get unique languages from repos
  const availableLanguages = [...new Set(repos.map(repo => repo.language).filter(Boolean))].sort()

  return (
    <div
      className={`min-h-screen p-4 md:p-8 transition-colors ${
        isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header with title and theme toggle */}
        <div className="flex items-center justify-between mb-6">
          <h1
            className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            GitHub Repo Stats Viewer
          </h1>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
                : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Rate Limit Status */}
        <RateLimitStatus token={token} isDarkMode={isDarkMode} />

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className={`col-span-1 md:col-span-2 p-2 rounded border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Enter GitHub username"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
            >
              Fetch
            </button>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={token}
              onChange={e => setToken(e.target.value)}
              type="password"
              className={`col-span-1 md:col-span-2 p-2 rounded border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Optional: Personal Access Token (for higher rate limits)"
            />
            <div className={`p-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Your PAT is stored in your browser's localStorage only.
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-rose-700 text-white p-3 rounded mb-4">Error: {error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className={`p-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
            Loading... please wait.
          </div>
        )}

        {/* Profile Section */}
        {profile && (
          <section
            className={`p-4 rounded mb-6 ${
              isDarkMode ? 'bg-slate-800' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="w-20 h-20 rounded"
              />
              <div>
                <div
                  className={`text-lg font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {profile.name || profile.login}
                </div>
                <div className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                  {profile.bio}
                </div>
                <div
                  className={`mt-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                >
                  {profile.followers} followers · {profile.following} following ·{' '}
                  {profile.public_repos} repos
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className={`p-3 rounded ${
                  isDarkMode ? 'bg-slate-900' : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Total Stars
                </div>
                <div
                  className={`text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {humanNumber(totalStars)}
                </div>
              </div>
              <div
                className={`p-3 rounded ${
                  isDarkMode ? 'bg-slate-900' : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Total Forks
                </div>
                <div
                  className={`text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {humanNumber(totalForks)}
                </div>
              </div>
              <div
                className={`p-3 rounded ${
                  isDarkMode ? 'bg-slate-900' : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Top Languages
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {Object.keys(languages).slice(0, 3).join(', ') || '—'}
                </div>
              </div>
            </div>

            {/* Language Chart */}
            {Object.keys(languages).length > 0 && (
              <div className="mt-6">
                <h3
                  className={`text-lg font-medium mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Language Distribution
                </h3>
                <LanguageChart languages={languages} isDarkMode={isDarkMode} />
              </div>
            )}
          </section>
        )}

        {/* Repositories Section */}
        {repos.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xl font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Repositories ({filteredRepos.length})
              </h2>
            </div>

            {/* Search and Filter Controls */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search repositories..."
                className={`p-2 rounded border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <select
                value={languageFilter}
                onChange={e => setLanguageFilter(e.target.value)}
                className={`p-2 rounded border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Languages</option>
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className={`p-2 rounded border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="updated">Sort by: Recently Updated</option>
                <option value="stars">Sort by: Most Stars</option>
                <option value="forks">Sort by: Most Forks</option>
                <option value="name">Sort by: Name</option>
              </select>
            </div>

            {/* Repository List */}
            {filteredRepos.length === 0 ? (
              <div className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                No repositories found matching your criteria.
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredRepos.map(repo => (
                  <RepoCard key={repo.id} repo={repo} isDarkMode={isDarkMode} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className={`mt-8 text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
          Built with ❤️ · Client-side only · Provide PAT if you get rate-limited
        </footer>
      </div>
    </div>
  )
}

export default App
