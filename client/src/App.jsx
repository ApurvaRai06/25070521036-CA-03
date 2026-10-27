import { useEffect, useMemo, useState } from 'react'
import { SAMPLE_MOVIES, STATUSES } from './data'
import AuthPage from './components/AuthPage'
import MovieCard from './components/MovieCard'
import MovieDetailsModal from './components/MovieDetailsModal'
import MovieFormModal from './components/MovieFormModal'
import SearchAndFilters from './components/SearchAndFilters'

const AUTH_STORAGE_KEY = 'movie-tracker-auth-token'
const USER_STORAGE_KEY = 'movie-tracker-auth-user'
const MOVIE_CACHE_PREFIX = 'movie-tracker-library-'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

const readCachedMovies = (userId) => {
  try {
    const storedMovies = localStorage.getItem(`${MOVIE_CACHE_PREFIX}${userId}`)
    return storedMovies ? JSON.parse(storedMovies) : SAMPLE_MOVIES
  } catch {
    return SAMPLE_MOVIES
  }
}

const toApiPayload = ({ id, createdAt, updatedAt, ...movie }) => movie

async function requestApi(path, options = {}, token = localStorage.getItem(AUTH_STORAGE_KEY)) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  const responseBody = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(responseBody.error || responseBody.message || 'The API request failed')
  }
  return responseBody
}

function TrackerApp({ token, user, onLogout }) {
  const [movies, setMovies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiState, setApiState] = useState('connecting')
  const [apiMessage, setApiMessage] = useState('')
  const [activeStatus, setActiveStatus] = useState('Watched')
  const [search, setSearch] = useState('')
  const [selectedGenres, setSelectedGenres] = useState([])
  const [sortBy, setSortBy] = useState('recent')
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [editingMovie, setEditingMovie] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const cacheKey = `${MOVIE_CACHE_PREFIX}${user.id}`

  useEffect(() => {
    if (!isLoading) localStorage.setItem(cacheKey, JSON.stringify(movies))
  }, [cacheKey, movies, isLoading])

  useEffect(() => {
    let isCancelled = false

    async function loadMovies() {
      try {
        const serverMovies = await requestApi('/movies', {}, token)
        if (!isCancelled) {
          setMovies(serverMovies)
          setApiState('connected')
          setApiMessage('')
        }
      } catch (error) {
        if (!isCancelled) {
          setMovies(readCachedMovies(user.id))
          setApiState('offline')
          setApiMessage('API unavailable, showing cached library')
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    loadMovies()
    return () => { isCancelled = true }
  }, [token, user.id])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      if (isFormOpen) setIsFormOpen(false)
      else if (selectedMovie) setSelectedMovie(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isFormOpen, selectedMovie])

  const statusCounts = useMemo(() => STATUSES.reduce((counts, status) => {
    counts[status] = movies.filter((movie) => movie.status === status).length
    return counts
  }, {}), [movies])

  const visibleMovies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const filtered = movies.filter((movie) => {
      const matchesStatus = movie.status === activeStatus
      const matchesSearch = !normalizedSearch || movie.title.toLowerCase().includes(normalizedSearch)
      const matchesGenre = !selectedGenres.length || selectedGenres.some((genre) => movie.genres.includes(genre))
      return matchesStatus && matchesSearch && matchesGenre
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title)
      if (sortBy === 'title-desc') return b.title.localeCompare(a.title)
      if (sortBy === 'year-asc') return a.year - b.year
      if (sortBy === 'year-desc') return b.year - a.year
      return movies.indexOf(b) - movies.indexOf(a)
    })
  }, [movies, activeStatus, search, selectedGenres, sortBy])

  const openAddForm = () => {
    setEditingMovie(null)
    setSelectedMovie(null)
    setIsFormOpen(true)
  }

  const openEditForm = (movie) => {
    setSelectedMovie(null)
    setEditingMovie(movie)
    setIsFormOpen(true)
  }

  const handleSave = async (movie) => {
    const hasMongoId = /^[a-f\d]{24}$/i.test(movie.id || '')
    const isEditing = Boolean(movie.id && movies.some((currentMovie) => currentMovie.id === movie.id))

    try {
      const savedMovie = await requestApi(hasMongoId && isEditing ? `/movies/${movie.id}` : '/movies', {
        method: hasMongoId && isEditing ? 'PUT' : 'POST',
        body: JSON.stringify(toApiPayload(movie)),
      }, token)
      setMovies((currentMovies) => {
        const exists = currentMovies.some((currentMovie) => currentMovie.id === savedMovie.id)
        return exists
          ? currentMovies.map((currentMovie) => currentMovie.id === savedMovie.id ? savedMovie : currentMovie)
          : [savedMovie, ...currentMovies]
      })
      setApiState('connected')
      setApiMessage('')
    } catch (error) {
      setMovies((currentMovies) => {
        const exists = currentMovies.some((currentMovie) => currentMovie.id === movie.id)
        return exists ? currentMovies.map((currentMovie) => currentMovie.id === movie.id ? movie : currentMovie) : [movie, ...currentMovies]
      })
      setApiState('offline')
      setApiMessage(`API save failed: ${error.message}`)
    }
    setActiveStatus(movie.status)
    setIsFormOpen(false)
    setEditingMovie(null)
  }

  const handleDelete = async (movie) => {
    const shouldDelete = window.confirm(`Delete “${movie.title}” from your library?`)
    if (!shouldDelete) return

    try {
      if (/^[a-f\d]{24}$/i.test(movie.id || '')) {
        await requestApi(`/movies/${movie.id}`, { method: 'DELETE' }, token)
      }
      setApiState('connected')
      setApiMessage('')
    } catch (error) {
      setApiState('offline')
      setApiMessage(`API delete failed: ${error.message}`)
    }
    setMovies((currentMovies) => currentMovies.filter((currentMovie) => currentMovie.id !== movie.id))
    setSelectedMovie(null)
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedGenres([])
    setSortBy('recent')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">◈</span>
          <span>MY WATCHLIST</span>
        </div>
        <div className="topbar-actions">
          <span className="user-greeting">Hi, {user.name.split(' ')[0]}</span>
          <button className="button button-secondary logout-button" type="button" onClick={onLogout}>Log out</button>
          <button className="button button-primary add-button" type="button" onClick={openAddForm}>
            <span>＋</span> Add movie
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="page-heading">
          <div>
            <p className="eyebrow">A quiet place for great stories</p>
            <h1>Movie <span>/</span> Series Tracker</h1>
            <p className="page-subtitle">Keep track of what you loved, what you’re watching, and what’s next.</p>
          </div>
          <div className="library-stat"><strong>{movies.length}</strong><span>titles in library</span></div>
        </section>

        <nav className="status-tabs" aria-label="Library sections">
          {STATUSES.map((status) => (
            <button
              className={`status-tab ${activeStatus === status ? 'is-active' : ''}`}
              type="button"
              onClick={() => setActiveStatus(status)}
              key={status}
            >
              {status}
              <span>{statusCounts[status]}</span>
            </button>
          ))}
        </nav>

        <SearchAndFilters
          search={search}
          setSearch={setSearch}
          selectedGenres={selectedGenres}
          setSelectedGenres={setSelectedGenres}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onClear={clearFilters}
        />

        <section className="library-section" aria-live="polite">
          <div className="section-heading">
            <div>
              <h2>{activeStatus}</h2>
              <p>{visibleMovies.length} {visibleMovies.length === 1 ? 'title' : 'titles'} showing</p>
            </div>
            <div className="section-rule" />
          </div>

          {visibleMovies.length ? (
            <div className="movie-grid">
              {visibleMovies.map((movie) => <MovieCard movie={movie} onClick={setSelectedMovie} key={movie.id} />)}
            </div>
          ) : isLoading ? (
            <div className="empty-state">
              <div className="empty-icon">◌</div>
              <h3>Loading your library</h3>
              <p>Connecting to the Movie Tracker API and local MongoDB.</p>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">⌕</div>
              <h3>No titles found</h3>
              <p>Try a different search or clear your filters to see more of your library.</p>
              <button className="button button-secondary" type="button" onClick={clearFilters}>Clear filters</button>
            </div>
          )}
        </section>

        <footer className="page-footer">
          <span><span className={`footer-dot footer-dot-${apiState}`} /> {apiState === 'connected' ? 'Connected to local MongoDB' : apiState === 'connecting' ? 'Connecting to local MongoDB…' : 'Offline mode · cached data'}</span>
          <span>{apiMessage || 'Built for your next great watch'}</span>
        </footer>
      </main>

      {selectedMovie && <MovieDetailsModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} onEdit={openEditForm} onDelete={handleDelete} />}
      {isFormOpen && <MovieFormModal movie={editingMovie} onClose={() => { setIsFormOpen(false); setEditingMovie(null) }} onSave={handleSave} />}
    </div>
  )
}

function App() {
  const [session, setSession] = useState(() => ({
    token: localStorage.getItem(AUTH_STORAGE_KEY),
    user: readStoredUser(),
  }))
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(session.token))

  useEffect(() => {
    if (!session.token) return undefined
    requestApi('/auth/me', {}, session.token)
      .then(({ user }) => setSession((current) => ({ ...current, user })))
      .catch(() => {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        localStorage.removeItem(USER_STORAGE_KEY)
        setSession({ token: null, user: null })
      })
      .finally(() => setIsCheckingSession(false))
    return undefined
  }, [session.token])

  const handleAuthenticated = ({ token, user }) => {
    localStorage.setItem(AUTH_STORAGE_KEY, token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    setSession({ token, user })
    setIsCheckingSession(false)
  }

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    setSession({ token: null, user: null })
  }

  if (isCheckingSession) {
    return <main className="auth-shell"><div className="auth-loading">Checking your session…</div></main>
  }
  if (!session.token || !session.user) return <AuthPage onAuthenticated={handleAuthenticated} />
  return <TrackerApp token={session.token} user={session.user} onLogout={handleLogout} />
}

export default App
