import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function makeRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export default function Lobby() {
  const navigate = useNavigate()
  const [name, setName] = useState(() => localStorage.getItem('goat.playerName') || 'Duelist')
  const [joinCode, setJoinCode] = useState('')
  const [createdRoom, setCreatedRoom] = useState('')
  const deckCount = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('deck.main') || '[]').length as number } catch { return 0 }
  }, [])

  function persistName() {
    localStorage.setItem('goat.playerName', name.trim() || 'Duelist')
  }

  function practice() {
    persistName()
    navigate('/play?mode=practice')
  }

  function createRoom() {
    persistName()
    const code = makeRoomCode()
    localStorage.setItem('goat.roomCode', code)
    setCreatedRoom(code)
  }

  function joinRoom() {
    if (!joinCode.trim()) return
    persistName()
    localStorage.setItem('goat.roomCode', joinCode.trim().toUpperCase())
    navigate('/play?mode=room')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-stack">
      <div className="page-heading">
        <div>
          <div className="eyebrow">DUELIST ISLAND · ALPHA</div>
          <h1>Duel Lobby</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
        <section className="panel">
          <h3>Duelist</h3>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: 10 }}
          />
          <p style={{ opacity: 0.72 }}>Saved Main Deck: {deckCount} cards</p>
          <button onClick={practice}>Practice Duel</button>
        </section>

        <section className="panel">
          <h3>Private Room</h3>
          <p style={{ opacity: 0.72 }}>
            Room creation UI is ready. Real-time server synchronization is the next networking milestone.
          </p>
          <button onClick={createRoom}>Create Room</button>
          {createdRoom && (
            <div style={{ fontSize: 30, letterSpacing: 6, fontWeight: 900, margin: '14px 0' }}>{createdRoom}</div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value)}
              placeholder="ROOM CODE"
              style={{ flex: 1, minWidth: 0, padding: 10 }}
            />
            <button onClick={joinRoom}>Join</button>
          </div>
        </section>

        <section className="panel">
          <h3>Format Lock</h3>
          <p>April 2005 Forbidden/Limited list.</p>
          <p>TLM legal. Cybernetic Revolution and Exarion Universe excluded.</p>
          <p style={{ opacity: 0.72 }}>The card pool follows the common US Nationals / SJC Seattle / SJC Indianapolis GOAT standard.</p>
        </section>
      </div>
    </motion.div>
  )
}
