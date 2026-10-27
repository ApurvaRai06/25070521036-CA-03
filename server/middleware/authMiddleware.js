const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function requireAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization || ''
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null
    if (!token) return res.status(401).json({ message: 'Authentication is required' })

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.userId).select('-passwordHash')
    if (!user) return res.status(401).json({ message: 'User account no longer exists' })

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' })
  }
}

module.exports = { requireAuth }
