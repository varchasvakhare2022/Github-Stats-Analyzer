import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RepoCard from './components/RepoCard'
import RateLimitStatus from './components/RateLimitStatus'
import LanguageChart from './components/LanguageChart'
import SkeletonLoader from './components/SkeletonLoader'
import ContributionsGraph from './components/ContributionsGraph'
import FollowersFollowingChart from './components/FollowersFollowingChart'
import AnimatedBackground from './components/AnimatedBackground'
import { exportToPDF } from './utils/exportToPDF'

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
  const [isExporting, setIsExporting] = useState(false)

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

  // Handle PDF Export
  const handleExportPDF = async () => {
    if (!profile || repos.length === 0) {
      setError('No data to export. Please fetch a user profile first.')
      return
    }

    try {
      await exportToPDF(
        profile,
        repos,
        totalStars,
        totalForks,
        languages,
        username,
        setIsExporting
      )
    } catch (error) {
      console.error('Error exporting PDF:', error)
      setError('Failed to export PDF. Please try again.')
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen w-full p-4 md:p-8 transition-all duration-300 relative ${
        isDarkMode
          ? 'text-white'
          : 'text-gray-900'
      }`}
      style={{
        background: 'transparent',
      }}
    >
      {/* Animated Background - Behind everything */}
      <AnimatedBackground isDarkMode={isDarkMode} />
      
      {/* Content Container - Above background */}
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header with title and theme toggle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <motion.h1
            className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${
              isDarkMode
                ? 'from-emerald-400 via-cyan-400 to-blue-400'
                : 'from-emerald-600 via-cyan-600 to-blue-600'
            } bg-clip-text text-transparent`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            GitHub Repo Stats Viewer
          </motion.h1>
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 rounded-xl transition-all duration-300 shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-slate-900 hover:shadow-yellow-400/50'
                : 'bg-gradient-to-br from-slate-800 to-slate-900 text-yellow-400 hover:shadow-slate-900/50 border border-gray-200'
            }`}
            aria-label="Toggle theme"
          >
            <span className="text-2xl">{isDarkMode ? '☀️' : '🌙'}</span>
          </motion.button>
        </motion.div>

        {/* Rate Limit Status */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <RateLimitStatus token={token} isDarkMode={isDarkMode} />
        </motion.div>

        {/* Search Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.input
              value={username}
              onChange={e => setUsername(e.target.value)}
              whileFocus={{ scale: 1.02 }}
              className={`col-span-1 md:col-span-2 p-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                isDarkMode
                  ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400 backdrop-blur-sm'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 shadow-md'
              }`}
              placeholder="Enter GitHub username"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Fetch
            </motion.button>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.input
value={token}
              onChange={e => setToken(e.target.value)}
              type="password"
              whileFocus={{ scale: 1.02 }}
              className={`col-span-1 md:col-span-2 p-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                isDarkMode
                  ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400 backdrop-blur-sm'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 shadow-md'
              }`}
placeholder="Optional: Personal Access Token (for higher rate limits)"
/>
            <motion.div
              className={`p-3 text-sm rounded-xl ${
                isDarkMode ? 'text-slate-400 bg-slate-800/50' : 'text-gray-600 bg-gray-50'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Your PAT is stored in your browser's localStorage only.
            </motion.div>
</div>
        </motion.form>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6 p-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <span className="font-medium">Error: {error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Skeleton */}
        {loading && <SkeletonLoader isDarkMode={isDarkMode} />}

        {/* Profile Section */}
        <AnimatePresence mode="wait">
          {profile && !loading && (
            <motion.section
              key="profile"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className={`p-6 md:p-8 rounded-2xl mb-8 shadow-2xl backdrop-blur-sm ${
                isDarkMode
                  ? 'bg-gradient-to-br from-slate-800/90 via-slate-700/90 to-slate-800/90 border border-slate-600'
                  : 'bg-white border border-gray-200 shadow-xl'
              }`}
            >
              {/* Export PDF Button */}
              <motion.div
                className="flex justify-end mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 ${
                    isExporting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white hover:shadow-xl'
                  }`}
                >
                  {isExporting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">📄</span>
                      <span>Export as PDF</span>
                    </>
                  )}
                </motion.button>
              </motion.div>

              <motion.div
                className="flex items-center gap-6 mb-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.img
                  src={profile.avatar_url}
                  alt="avatar"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-emerald-500 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  variants={itemVariants}
                />
                <motion.div variants={itemVariants}>
                  <motion.div
                    className={`text-2xl md:text-3xl font-bold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                    whileHover={{ x: 5 }}
                  >
                    {profile.name || profile.login}
                  </motion.div>
                  <motion.div
                    className={`text-lg mb-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {profile.bio}
                  </motion.div>
                  <motion.div
                    className={`flex gap-4 text-sm ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.span whileHover={{ scale: 1.1 }}>
                      👥 {profile.followers} followers
                    </motion.span>
                    <motion.span whileHover={{ scale: 1.1 }}>
                      ➕ {profile.following} following
                    </motion.span>
                    <motion.span whileHover={{ scale: 1.1 }}>
                      📦 {profile.public_repos} repos
                    </motion.span>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Followers/Following Chart */}
              <FollowersFollowingChart profile={profile} isDarkMode={isDarkMode} />

              {/* Stats Grid */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {[
                  { label: 'Total Stars', value: humanNumber(totalStars), icon: '⭐' },
                  { label: 'Total Forks', value: humanNumber(totalForks), icon: '🍴' },
                  {
                    label: 'Top Languages',
                    value: Object.keys(languages).slice(0, 3).join(', ') || '—',
                    icon: '💻',
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`p-6 rounded-xl shadow-lg backdrop-blur-sm border ${
                      isDarkMode
                        ? 'bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700 hover:border-emerald-500'
                        : 'bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-emerald-500 shadow-md'
                    } transition-all duration-300`}
                  >
                    <div
                      className={`text-xs font-semibold mb-2 uppercase tracking-wide ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}
                    >
                      {stat.icon} {stat.label}
</div>
                    <motion.div
                      className={`text-3xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                    >
                      {stat.value}
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Contributions Graph */}
              <ContributionsGraph username={profile.login} isDarkMode={isDarkMode} />

              {/* Language Chart */}
              {Object.keys(languages).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.h3
                    className={`text-xl font-bold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                    whileHover={{ x: 5 }}
                  >
                    Language Distribution
                  </motion.h3>
                  <LanguageChart languages={languages} isDarkMode={isDarkMode} />
                </motion.div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Repositories Section */}
        <AnimatePresence>
          {repos.length > 0 && !loading && (
            <motion.section
              key="repos"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="flex items-center justify-between mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.h2
                  className={`text-2xl md:text-3xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  Repositories{' '}
                  <span
                    className={`text-lg font-normal ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}
                  >
                    ({filteredRepos.length})
                  </span>
                </motion.h2>
              </motion.div>

              {/* Search and Filter Controls */}
              <motion.div
                className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  whileFocus={{ scale: 1.02 }}
                  placeholder="Search repositories..."
                  className={`p-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400 backdrop-blur-sm'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 shadow-md'
                  }`}
                />
                <motion.select
                  value={languageFilter}
                  onChange={e => setLanguageFilter(e.target.value)}
                  whileFocus={{ scale: 1.02 }}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-slate-800/80 border-slate-700 text-white backdrop-blur-sm'
                      : 'bg-white border-gray-300 text-gray-900 shadow-md'
                  }`}
                >
                  <option value="">All Languages</option>
                  {availableLanguages.map(lang => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </motion.select>
                <motion.select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  whileFocus={{ scale: 1.02 }}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-slate-800/80 border-slate-700 text-white backdrop-blur-sm'
                      : 'bg-white border-gray-300 text-gray-900 shadow-md'
                  }`}
                >
                  <option value="updated">Sort by: Recently Updated</option>
                  <option value="stars">Sort by: Most Stars</option>
                  <option value="forks">Sort by: Most Forks</option>
                  <option value="name">Sort by: Name</option>
                </motion.select>
              </motion.div>

              {/* Repository List */}
              <AnimatePresence mode="wait">
                {filteredRepos.length === 0 ? (
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-8 text-center rounded-xl ${
                      isDarkMode ? 'text-slate-400 bg-slate-800/50' : 'text-gray-600 bg-gray-50'
                    }`}
                  >
                    No repositories found matching your criteria.
                  </motion.div>
                ) : (
                  <motion.div
                    key="repo-list"
                    className="grid gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredRepos.map((repo, index) => (
                      <RepoCard
                        key={repo.id}
                        repo={repo}
                        isDarkMode={isDarkMode}
                        index={index}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          className={`mt-12 text-center text-sm ${
            isDarkMode ? 'text-slate-500' : 'text-gray-500'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Built with ❤️ by Varchasva Khare
        </motion.footer>
</div>
    </motion.div>
)
}

export default App
