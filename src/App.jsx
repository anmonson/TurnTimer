import React, { useState, useEffect, useCallback, useRef } from 'react'

function App() {
  // State management
  const [players, setPlayers] = useState(['andy', 'jake', 'will', 'justin'])
  const [timers, setTimers] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [countingDown, setCountingDown] = useState(true)
  const [duration, setDuration] = useState(90)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [lastFlashedSecond, setLastFlashedSecond] = useState(null)

  // Refs for audio and intervals
  const intervalRef = useRef(null)
  const tensecBeepRef = useRef(null)
  const threesecBeepRef = useRef(null)

  // Initialize audio refs
  useEffect(() => {
    tensecBeepRef.current = new Audio('/sounds/10secondding.mp3')
    threesecBeepRef.current = new Audio('/sounds/4secondbeep.mp3')
  }, [])

  // Initialize timers when players or settings change
  useEffect(() => {
    setTimers(players.map(() => (countingDown ? duration : 0)))
  }, [players, countingDown, duration])

  // Format time helper
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Get card position helper
  const getCardPosition = (index, currentIndex, totalPlayers) => {
    const diff = index - currentIndex
    const normalizedDiff = ((diff % totalPlayers) + totalPlayers) % totalPlayers
    
    if (normalizedDiff === 0) return 'current'
    if (normalizedDiff === 1 || (normalizedDiff === totalPlayers - 1 && totalPlayers === 2)) return 'next'
    if (normalizedDiff === totalPlayers - 1) return 'prev'
    return 'hidden'
  }

  // Timer logic
  useEffect(() => {
    if (isRunning && players.length > 0) {
      intervalRef.current = setInterval(() => {
        setTimers(prevTimers => {
          const newTimers = [...prevTimers]
          
          if (countingDown) {
            if (newTimers[currentIndex] > 0) {
              newTimers[currentIndex] = Math.max(0, newTimers[currentIndex] - 0.1)
            } else {
              // Time's up, move to next player
              setIsRunning(false)
              nextPlayer()
              return newTimers
            }
          } else {
            newTimers[currentIndex] += 0.1
          }
          
          // Handle audio alerts and visual effects for countdown
          if (countingDown) {
            const timeLeft = newTimers[currentIndex]
            const secondsLeft = Math.floor(timeLeft)
            
            if (secondsLeft === 10 && lastFlashedSecond !== 10) {
              tensecBeepRef.current?.play()
              setLastFlashedSecond(10)
            } else if ([5, 4, 3, 2, 1].includes(secondsLeft) && secondsLeft !== lastFlashedSecond) {
              setLastFlashedSecond(secondsLeft)
              if (secondsLeft === 3) {
                threesecBeepRef.current?.play()
              }
            }
          }
          
          return newTimers
        })
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, currentIndex, countingDown, lastFlashedSecond, players.length])

  // Navigation functions
  const nextPlayer = useCallback(() => {
    if (players.length === 0 || isTransitioning) return
    
    setIsTransitioning(true)
    setCurrentIndex(prev => (prev + 1) % players.length)
    setLastFlashedSecond(null)
    
    // Reset timer for new current player
    setTimeout(() => {
      setTimers(prevTimers => {
        const newTimers = [...prevTimers]
        const newIndex = (currentIndex + 1) % players.length
        newTimers[newIndex] = countingDown ? duration : 0
        return newTimers
      })
      setIsTransitioning(false)
    }, 600)
  }, [players.length, isTransitioning, currentIndex, countingDown, duration])

  const prevPlayer = useCallback(() => {
    if (players.length === 0 || isTransitioning) return
    
    setIsTransitioning(true)
    setCurrentIndex(prev => (prev - 1 + players.length) % players.length)
    setLastFlashedSecond(null)
    
    // Reset timer for new current player
    setTimeout(() => {
      setTimers(prevTimers => {
        const newTimers = [...prevTimers]
        const newIndex = (currentIndex - 1 + players.length) % players.length
        newTimers[newIndex] = countingDown ? duration : 0
        return newTimers
      })
      setIsTransitioning(false)
    }, 600)
  }, [players.length, isTransitioning, currentIndex, countingDown, duration])

  // Toggle timer
  const toggleTimer = () => {
    setIsRunning(prev => !prev)
  }

  // Player management
  const addPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers(prev => [...prev, newPlayerName.trim()])
      setNewPlayerName('')
    }
  }

  const removePlayer = (index) => {
    setPlayers(prev => prev.filter((_, i) => i !== index))
    if (currentIndex >= players.length - 1) {
      setCurrentIndex(Math.max(0, players.length - 2))
    }
  }

  const updatePlayerName = (index, name) => {
    setPlayers(prev => prev.map((player, i) => i === index ? name : player))
  }

  // Mode toggle
  const toggleMode = () => {
    setCountingDown(prev => !prev)
  }

  // Reset all timers
  const resetAll = () => {
    setTimers(players.map(() => 0))
    setIsRunning(false)
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't interfere with input fields
      if (e.target.tagName === 'INPUT') return
      
      if (e.code === 'Space') {
        e.preventDefault()
        nextPlayer()
      } else if (e.code === 'Backspace') {
        e.preventDefault()
        prevPlayer()
      } else if (e.key === 'p' || e.code === 'KeyP') {
        e.preventDefault()
        toggleTimer()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [nextPlayer, prevPlayer])

  return (
    <div className="App">
      {/* Setup Screen (Sidebar) */}
      <div className={`shelf ${isMenuOpen ? 'open' : ''}`}>
        <button 
          className="close-button"
          onClick={() => setIsMenuOpen(false)}
        >
          ✕
        </button>
        
        <div className="player-menu">
          <br />
          <ul className="player-list">
            {players.map((player, index) => (
              <li key={index}>
                <input
                  type="text"
                  value={player}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                />
                <button onClick={() => removePlayer(index)}>
                  🗑️
                </button>
              </li>
            ))}
          </ul>
          
          <div className="add-player">
            <input
              type="text"
              placeholder="New player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
            />
            <button onClick={addPlayer}>Add Player</button>
          </div>
        </div>
        
        <div className="menu-bottom">
          <label className="mode-switch">
            Count Up
            <input
              type="checkbox"
              checked={countingDown}
              onChange={toggleMode}
            />
            <span className="slider"></span>
            <span className="mode-label">Count Down</span>
          </label>
          
          <input
            type="number"
            placeholder="Turn time (sec)"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 90)}
            style={{ display: countingDown ? 'block' : 'none' }}
          />
          
          <button
            onClick={resetAll}
            style={{ display: countingDown ? 'none' : 'block' }}
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Main Screen */}
      <div className={`screen ${isMenuOpen ? 'mainScreenShifted' : ''}`}>
        <button 
          className="menu-button"
          onClick={() => setIsMenuOpen(true)}
          style={{ display: isMenuOpen ? 'none' : 'block' }}
        >
          ☰
        </button>

        <div className="carousel-container">
          <div className="carousel-track">
            {players.map((player, index) => {
              const position = getCardPosition(index, currentIndex, players.length)
              const isCurrent = position === 'current'
              const timer = timers[index] || 0
              const timeLeft = timer
              const secondsLeft = Math.floor(timeLeft)
              
              // Determine card classes for visual effects
              let cardClasses = `player-card ${position}`
              if (isCurrent && countingDown) {
                if (timeLeft <= 0.1) {
                  cardClasses += ' solid-red'
                } else if ([5, 4, 3, 2, 1].includes(secondsLeft) && secondsLeft === lastFlashedSecond) {
                  cardClasses += ' flash-red'
                }
              }
              
              // Calculate progress angle for current player
              const progressAngle = isCurrent && countingDown ? (timer / duration) * 360 : 360
              
              return (
                <div
                  key={index}
                  className={cardClasses}
                  style={{
                    '--progress-angle': `${progressAngle}deg`
                  }}
                  onClick={() => {
                    if (position === 'next') nextPlayer()
                    else if (position === 'prev') prevPlayer()
                  }}
                >
                  <div className="player-name">{player}</div>
                  <div className="timer">{formatTime(timer)}</div>
                  {isCurrent && (
                    <button 
                      className={`pause-button large-button ${isRunning ? 'paused' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleTimer()
                      }}
                    >
                      {isRunning ? '⏸' : '⏵'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="keyboard-instructions">
          <div>Space: Next</div>
          <div>Backspace: Previous</div>
          <div>P: Pause/Play</div>
        </div>
      </div>
    </div>
  )
}

export default App
