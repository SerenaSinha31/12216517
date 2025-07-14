import { useState, useEffect } from 'react'
import './App.css'
import StaticsPage from "./StaticsPage";

import { logInfo, logError, logDebug, logWarn } from '../../Logging Middleware'

function App() {
  const [urlInputs, setUrlInputs] = useState([
    { longUrl: '', validity: 30, customShortcode: '' }
  ])
  const [shortenedUrls, setShortenedUrls] = useState([])
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    logInfo('App', 'URLShortener', 'Application initialized')
  }, [])

  const generateShortcode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    logDebug('App', 'URLShortener', `Generated shortcode: ${result}`)
    return result
  }

  const handleInputChange = (idx, field, value) => {
    setUrlInputs(inputs =>
      inputs.map((input, i) =>
        i === idx ? { ...input, [field]: field === 'validity' ? Math.max(1, parseInt(value) || 30) : value } : input
      )
    )
  }

  const handleAddInput = () => {
    if (urlInputs.length < 5) {
      setUrlInputs([...urlInputs, { longUrl: '', validity: 30, customShortcode: '' }])
    }
  }

  const handleRemoveInput = (idx) => {
    setUrlInputs(inputs => inputs.filter((_, i) => i !== idx))
  }

  const validateInputs = () => {
    for (let input of urlInputs) {
      try {
        new URL(input.longUrl)
      } catch {
        alert('Please enter a valid URL (including http:// or https://) for all entries.')
        return false
      }
      if (!Number.isInteger(input.validity) || input.validity < 1) {
        alert('Validity must be an integer greater than 0.')
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateInputs()) return

    const newShortened = []
    for (let input of urlInputs) {
      try {
        const shortcode = input.customShortcode || generateShortcode()
        const expirationDate = new Date(Date.now() + input.validity * 60000)
        const newShortUrl = `http://yourdomain.com/${shortcode}`

        newShortened.push({
          original: input.longUrl,
          shortened: newShortUrl,
          expiration: expirationDate,
          clicks: 0
        })

        logInfo('App', 'URLShortener', `URL shortened: ${input.longUrl} -> ${newShortUrl}`)
      } catch (error) {
        logError('App', 'URLShortener', `Error shortening URL: ${error.message}`)
        alert('An error occurred. Please try again.')
      }
    }
    setShortenedUrls(prev => [...prev, ...newShortened])
  }

  const handleRedirect = (shortUrl) => {
    setShortenedUrls(prev =>
      prev.map(url => {
        if (url.shortened === shortUrl) {
          if (new Date() < new Date(url.expiration)) {
            logInfo('App', 'URLShortener', `Redirecting to: ${url.original}`)
            window.open(url.original, '_blank')
            return { ...url, clicks: url.clicks + 1 }
          } else {
            logWarn('App', 'URLShortener', `Expired URL: ${shortUrl}`)
            alert('This short URL has expired.')
          }
        }
        return url
      })
    )
  }

  return (
    <div className="App">
      <h1>URL Shortener</h1>
      <button onClick={() => setShowStats(prev => !prev)}>
        {showStats ? 'Back to URL Shortener' : 'View Statistics'}
      </button>

      {showStats ? (
        <StaticsPage shortenedUrls={shortenedUrls} />
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            {urlInputs.map((input, idx) => (
              <div key={idx} className="url-input-row">
                <input
                  type="url"
                  value={input.longUrl}
                  onChange={e => handleInputChange(idx, 'longUrl', e.target.value)}
                  placeholder="Enter a long URL"
                  required
                />
                <input
                  type="text"
                  value={input.customShortcode}
                  onChange={e => handleInputChange(idx, 'customShortcode', e.target.value)}
                  placeholder="Custom shortcode (optional)"
                />
                <input
                  type="number"
                  value={input.validity}
                  onChange={e => handleInputChange(idx, 'validity', e.target.value)}
                  placeholder="Validity (minutes)"
                  min="1"
                />
                {urlInputs.length > 1 && (
                  <button type="button" onClick={() => handleRemoveInput(idx)} className="remove-btn">
                    Remove
                  </button>
                )}
              </div>
            ))}
            {urlInputs.length < 5 && (
              <button type="button" onClick={handleAddInput} className="add-btn">Add URL</button>
            )}
            <button type="submit">Shorten URLs</button>
          </form>

          <div className="url-list">
            <h2>Shortened URLs:</h2>
            <ul>
              {shortenedUrls.map((url, index) => (
                <li key={index}>
                  <a href="#" onClick={() => handleRedirect(url.shortened)}>{url.shortened}</a>
                  {' - '}
                  <span>Expires: {new Date(url.expiration).toLocaleString()}</span>
                  {' - '}
                  <span>Original: {url.original}</span>
                  {' - '}
                  <span>Clicks: {url.clicks}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

export default App
