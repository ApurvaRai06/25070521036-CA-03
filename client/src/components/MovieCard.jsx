import GenreTags from './GenreTags'
import PosterImage from './PosterImage'
import Stars from './Stars'

function MovieCard({ movie, onClick }) {
  return (
    <button className="movie-card" onClick={() => onClick(movie)} type="button">
      <PosterImage movie={movie} />
      <div className="movie-card-body">
        <div className="movie-card-title-row">
          <h3>{movie.title}</h3>
          <span className="card-arrow" aria-hidden="true">↗</span>
        </div>
        <p className="movie-year">{movie.year} <span>•</span> {movie.language}</p>
        <GenreTags genres={movie.genres} limit={2} />
        <div className="card-rating-row">
          <Stars rating={movie.rating} />
          <span className="rating-value">{movie.rating ? `${movie.rating}.0` : 'Unrated'}</span>
        </div>
      </div>
    </button>
  )
}

export default MovieCard
