import { useState } from 'react'

function PosterImage({ movie, className = '' }) {
  const [hasError, setHasError] = useState(!movie.poster)
  const initials = movie.title
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <div className={`poster-wrap ${className}`}>
      {hasError ? (
        <div className="poster-fallback" aria-label={`${movie.title} poster placeholder`}>
          <span className="poster-fallback-mark">{initials}</span>
          <span className="poster-fallback-title">{movie.title}</span>
        </div>
      ) : (
        <img
          src={movie.poster}
          alt={`${movie.title} poster`}
          onError={() => setHasError(true)}
        />
      )}
      <span className="poster-category">{movie.category}</span>
    </div>
  )
}

export default PosterImage
