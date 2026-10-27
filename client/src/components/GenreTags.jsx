const genreClass = (genre) => `genre-${genre.toLowerCase().replaceAll(' ', '-')}`

function GenreTags({ genres = [], limit }) {
  const visibleGenres = limit ? genres.slice(0, limit) : genres
  const extraCount = limit && genres.length > limit ? genres.length - limit : 0

  return (
    <div className="genre-tags">
      {visibleGenres.map((genre) => (
        <span className={`genre-tag ${genreClass(genre)}`} key={genre}>
          {genre}
        </span>
      ))}
      {extraCount > 0 && <span className="genre-tag genre-more">+{extraCount}</span>}
    </div>
  )
}

export default GenreTags
