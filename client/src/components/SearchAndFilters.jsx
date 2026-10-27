import { useState } from 'react'
import { GENRES } from '../data'

function GenreFilter({ selectedGenres, onChange }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleGenre = (genre) => {
    onChange(
      selectedGenres.includes(genre)
        ? selectedGenres.filter((selected) => selected !== genre)
        : [...selectedGenres, genre],
    )
  }

  return (
    <div className="genre-filter">
      <button className={`filter-button ${selectedGenres.length ? 'has-value' : ''}`} type="button" onClick={() => setIsOpen(!isOpen)}>
        <span className="filter-icon">⌄</span>
        {selectedGenres.length ? `${selectedGenres.length} genres selected` : 'Filter by genre'}
        <span className="filter-chevron">▾</span>
      </button>
      {isOpen && (
        <div className="genre-menu">
          <div className="genre-menu-heading">
            <span>Choose genres</span>
            {selectedGenres.length > 0 && (
              <button type="button" onClick={() => onChange([])}>Clear</button>
            )}
          </div>
          <div className="genre-options">
            {GENRES.map((genre) => (
              <label className="genre-option" key={genre}>
                <input
                  type="checkbox"
                  checked={selectedGenres.includes(genre)}
                  onChange={() => toggleGenre(genre)}
                />
                <span>{genre}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SearchAndFilters({ search, setSearch, selectedGenres, setSelectedGenres, sortBy, setSortBy, onClear }) {
  const hasActiveFilters = search || selectedGenres.length || sortBy !== 'recent'

  return (
    <div className="toolbar">
      <label className="search-field">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search your library..."
          aria-label="Search your library"
        />
        {search && <button className="clear-search" type="button" onClick={() => setSearch('')} aria-label="Clear search">×</button>}
      </label>
      <GenreFilter selectedGenres={selectedGenres} onChange={setSelectedGenres} />
      <label className="sort-field">
        <span className="sort-label">Sort</span>
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort movies">
          <option value="recent">Recently added</option>
          <option value="title-asc">Title A–Z</option>
          <option value="title-desc">Title Z–A</option>
          <option value="year-desc">Release year ↓</option>
          <option value="year-asc">Release year ↑</option>
        </select>
      </label>
      {hasActiveFilters && <button className="reset-button" type="button" onClick={onClear}>Reset</button>}
    </div>
  )
}

export default SearchAndFilters
