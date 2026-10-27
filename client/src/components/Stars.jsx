function Stars({ rating, size = 'small' }) {
  return (
    <span className={`stars stars-${size}`} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span className={star <= rating ? 'star is-filled' : 'star'} key={star}>
          ★
        </span>
      ))}
    </span>
  )
}

export default Stars
