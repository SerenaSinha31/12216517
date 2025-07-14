import React from 'react'

function StatisticsPage({ shortenedUrls }) {
  return (
    <div className="statistics-page">
      <h1>Shortened URL Statistics</h1>
      {shortenedUrls.length === 0 ? (
        <p>No URLs have been shortened yet.</p>
      ) : (
        <ul>
          {shortenedUrls.map((url, idx) => (
            <li key={idx}>
              <strong>Shortened:</strong>{' '}
              <a href={url.shortened} target="_blank" rel="noopener noreferrer">
                {url.shortened}
              </a>
              <br />
              <strong>Original:</strong>{' '}
              <a href={url.original} target="_blank" rel="noopener noreferrer">
                {url.original}
              </a>
              <br />
              <strong>Expires:</strong> {new Date(url.expiration).toLocaleString()} <br />
              <strong>Clicks:</strong> {url.clicks}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default StatisticsPage

