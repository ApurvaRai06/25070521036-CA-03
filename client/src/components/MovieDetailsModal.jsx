import GenreTags from './GenreTags'
import PosterImage from './PosterImage'
import Stars from './Stars'

function DetailRow({ label, children }) {
  return (
    <div className="detail-row">
      <dt>{label}</dt>
      <dd>{children || '—'}</dd>
    </div>
  )
}

function MovieDetailsModal({ movie, onClose, onEdit, onDelete }) {
  if (!movie) return null

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="details-modal" role="dialog" aria-modal="true" aria-labelledby="details-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close details">×</button>
        <div className="details-hero">
          <PosterImage movie={movie} className="details-poster" />
          <div className="details-hero-copy">
            <span className="eyebrow">{movie.category} / {movie.year}</span>
            <h2 id="details-title">{movie.title}</h2>
            <GenreTags genres={movie.genres} />
            <div className="details-rating">
              <Stars rating={movie.rating} size="large" />
              <strong>{movie.rating ? `${movie.rating}.0` : 'Unrated'}</strong>
              <span>your rating</span>
            </div>
          </div>
        </div>
        <div className="details-content">
          <div className="status-pill"><span className="status-dot" /> {movie.status}</div>
          <dl className="details-list">
            <DetailRow label="Language">{movie.language}</DetailRow>
            <DetailRow label="Streaming on">{movie.platform}</DetailRow>
            <DetailRow label="Month watched">{movie.watchedMonth}</DetailRow>
            <DetailRow label="Category">{movie.category}</DetailRow>
            <DetailRow label="Release year">{movie.year}</DetailRow>
          </dl>
          <div className="details-actions">
            <button className="button button-primary" type="button" onClick={() => onEdit(movie)}>Edit details</button>
            <button className="button button-danger-ghost" type="button" onClick={() => onDelete(movie)}>Delete</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default MovieDetailsModal
