import { useEffect, useState } from 'react'
import { EMPTY_MOVIE, GENRES, STATUSES } from '../data'

function MovieFormModal({ movie, onClose, onSave }) {
  const isEditing = Boolean(movie)
  const [form, setForm] = useState(movie ? { ...movie } : { ...EMPTY_MOVIE })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(movie ? { ...movie } : { ...EMPTY_MOVIE })
    setErrors({})
  }, [movie])

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const toggleGenre = (genre) => updateField(
    'genres',
    form.genres.includes(genre) ? form.genres.filter((item) => item !== genre) : [...form.genres, genre],
  )

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'A title is required.'
    if (!form.year || Number(form.year) < 1888 || Number(form.year) > 2100) nextErrors.year = 'Enter a year between 1888 and 2100.'
    if (!form.genres.length) nextErrors.genres = 'Choose at least one genre.'
    if (form.rating < 0 || form.rating > 5) nextErrors.rating = 'Rating must be between 0 and 5.'

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    onSave({
      ...form,
      id: form.id || `movie-${Date.now()}`,
      title: form.title.trim(),
      year: Number(form.year),
      rating: Number(form.rating),
    })
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="form-heading">
          <div>
            <span className="eyebrow">Your library</span>
            <h2 id="form-title">{isEditing ? 'Edit title' : 'Add a movie or series'}</h2>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close form">×</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <label className="form-field form-field-wide">
              <span>Title <em>*</em></span>
              <input value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="e.g. Past Lives" autoFocus />
              {errors.title && <small className="error-text">{errors.title}</small>}
            </label>
            <label className="form-field">
              <span>Release year <em>*</em></span>
              <input type="number" value={form.year} onChange={(event) => updateField('year', event.target.value)} />
              {errors.year && <small className="error-text">{errors.year}</small>}
            </label>
            <label className="form-field">
              <span>Category</span>
              <select value={form.category} onChange={(event) => updateField('category', event.target.value)}>
                <option>Movie</option>
                <option>Series</option>
              </select>
            </label>
            <label className="form-field form-field-wide">
              <span>Poster image URL</span>
              <input type="url" value={form.poster} onChange={(event) => updateField('poster', event.target.value)} placeholder="https://..." />
            </label>
            <fieldset className="form-field form-field-wide genre-picker">
              <legend>Genres <em>*</em></legend>
              <div className="genre-picker-list">
                {GENRES.map((genre) => (
                  <label className={`genre-choice ${form.genres.includes(genre) ? 'is-selected' : ''}`} key={genre}>
                    <input type="checkbox" checked={form.genres.includes(genre)} onChange={() => toggleGenre(genre)} />
                    {genre}
                  </label>
                ))}
              </div>
              {errors.genres && <small className="error-text">{errors.genres}</small>}
            </fieldset>
            <label className="form-field">
              <span>Language</span>
              <input value={form.language} onChange={(event) => updateField('language', event.target.value)} placeholder="English" />
            </label>
            <label className="form-field">
              <span>Streaming platform</span>
              <input value={form.platform} onChange={(event) => updateField('platform', event.target.value)} placeholder="Netflix" />
            </label>
            <label className="form-field">
              <span>Your rating <small>(0–5)</small></span>
              <input type="number" min="0" max="5" step="1" value={form.rating} onChange={(event) => updateField('rating', event.target.value)} />
              {errors.rating && <small className="error-text">{errors.rating}</small>}
            </label>
            <label className="form-field">
              <span>Watching status</span>
              <select value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                {STATUSES.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>Month watched</span>
              <input value={form.watchedMonth} onChange={(event) => updateField('watchedMonth', event.target.value)} placeholder="March 2025" />
            </label>
          </div>
          <div className="form-actions">
            <button className="button button-secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="button button-primary" type="submit">{isEditing ? 'Save changes' : 'Add to library'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default MovieFormModal
