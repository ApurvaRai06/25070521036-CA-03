const bcrypt = require('bcryptjs')
const express = require('express')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const Movie = require('./models/Movie')
const User = require('./models/User')
const seedMovies = require('./seedData')
const { requireAuth } = require('./middleware/authMiddleware')

const app = express()
const port = process.env.PORT || 5000
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())

app.use(cors({
  origin: (origin, callback) => {
    const isLocalFrontend = origin && (() => {
      try {
        const parsedOrigin = new URL(origin)
        return parsedOrigin.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsedOrigin.hostname)
      } catch {
        return false
      }
    })()
    if (!origin || allowedOrigins.includes(origin) || isLocalFrontend) return callback(null, true)
    return callback(new Error('CORS origin not allowed'))
  },
}))
app.use(express.json())

const serializeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
})

const serializeMovie = (movie) => ({
  id: movie._id.toString(),
  title: movie.title,
  year: movie.year,
  poster: movie.poster,
  genres: movie.genres,
  language: movie.language,
  platform: movie.platform,
  rating: movie.rating,
  status: movie.status,
  watchedMonth: movie.watchedMonth,
  category: movie.category,
  createdAt: movie.createdAt,
  updatedAt: movie.updatedAt,
})

const getValidationMessage = (error) => {
  if (error.code === 11000) return 'An account with that email already exists.'
  if (error.name === 'ValidationError') {
    return Object.values(error.errors).map((item) => item.message).join(', ')
  }
  return error.message
}

const createToken = (user) => jwt.sign(
  { userId: user._id.toString() },
  process.env.JWT_SECRET,
  { expiresIn: '7d' },
)

async function seedLibraryForUser(userId) {
  const legacyMovies = await Movie.find({ user: { $exists: false } })
  if (legacyMovies.length) {
    await Movie.updateMany({ user: { $exists: false } }, { $set: { user: userId } })
    console.log(`Assigned ${legacyMovies.length} existing movies to the first account`)
    return
  }

  const userMovieCount = await Movie.countDocuments({ user: userId })
  if (!userMovieCount) {
    await Movie.insertMany(seedMovies.map((movie) => ({ ...movie, user: userId })))
    console.log(`Seeded ${seedMovies.length} sample movies for the new account`)
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'Movie Tracker API is running!' })
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

app.post('/api/auth/signup', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    if (name.length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters.' })
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' })
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    if (await User.exists({ email })) return res.status(409).json({ message: 'An account with that email already exists.' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, passwordHash })
    await seedLibraryForUser(user._id)
    res.status(201).json({ token: createToken(user), user: serializeUser(user) })
  } catch (error) {
    res.status(400).json({ message: 'Could not create account', error: getValidationMessage(error) })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    const user = await User.findOne({ email }).select('+passwordHash')
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Email or password is incorrect.' })
    }
    res.json({ token: createToken(user), user: serializeUser(user) })
  } catch (error) {
    res.status(400).json({ message: 'Could not log in', error: getValidationMessage(error) })
  }
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: serializeUser(req.user) })
})

app.get('/api/movies', requireAuth, async (req, res) => {
  try {
    const movies = await Movie.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(movies.map(serializeMovie))
  } catch (error) {
    res.status(500).json({ message: 'Could not load movies', error: getValidationMessage(error) })
  }
})

app.get('/api/movies/:id', requireAuth, async (req, res) => {
  try {
    const movie = await Movie.findOne({ _id: req.params.id, user: req.user._id })
    if (!movie) return res.status(404).json({ message: 'Movie not found' })
    res.json(serializeMovie(movie))
  } catch (error) {
    res.status(400).json({ message: 'Invalid movie id' })
  }
})

app.post('/api/movies', requireAuth, async (req, res) => {
  try {
    const movie = await Movie.create({ ...req.body, user: req.user._id })
    res.status(201).json(serializeMovie(movie))
  } catch (error) {
    res.status(400).json({ message: 'Could not create movie', error: getValidationMessage(error) })
  }
})

app.put('/api/movies/:id', requireAuth, async (req, res) => {
  try {
    const { user, ...updates } = req.body
    const movie = await Movie.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true },
    )
    if (!movie) return res.status(404).json({ message: 'Movie not found' })
    res.json(serializeMovie(movie))
  } catch (error) {
    res.status(400).json({ message: 'Could not update movie', error: getValidationMessage(error) })
  }
})

app.delete('/api/movies/:id', requireAuth, async (req, res) => {
  try {
    const movie = await Movie.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!movie) return res.status(404).json({ message: 'Movie not found' })
    res.json({ message: 'Movie deleted', id: req.params.id })
  } catch (error) {
    res.status(400).json({ message: 'Could not delete movie' })
  }
})

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || 'movieTracker',
    })
    console.log('Connected to local MongoDB')
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`))
  } catch (error) {
    console.error('Database connection failed:', error.message)
    process.exit(1)
  }
}

startServer()
