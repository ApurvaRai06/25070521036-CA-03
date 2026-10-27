const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Release year is required'],
      min: [1888, 'Release year must be 1888 or later'],
      max: [2100, 'Release year must be 2100 or earlier'],
    },
    poster: {
      type: String,
      trim: true,
      default: '',
    },
    genres: {
      type: [String],
      required: [true, 'At least one genre is required'],
      validate: {
        validator: (genres) => genres.length > 0,
        message: 'At least one genre is required',
      },
    },
    language: {
      type: String,
      trim: true,
      default: 'English',
    },
    platform: {
      type: String,
      trim: true,
      default: 'Netflix',
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot be above 5'],
      default: 0,
    },
    status: {
      type: String,
      enum: ['Watched', 'Currently Watching', 'Not Watched'],
      default: 'Not Watched',
    },
    watchedMonth: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['Movie', 'Series'],
      default: 'Movie',
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Movie', movieSchema)
