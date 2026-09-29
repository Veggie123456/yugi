import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="panel" style={{ padding: 28, marginTop: 24 }}>
        <div style={{ opacity: .7, fontWeight: 700, letterSpacing: 2 }}>SUMMER 2005. FOREVER.</div>
        <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 5.5rem)', lineHeight: .95, margin: '12px 0' }}>GOAT DUEL ONLINE</h1>
        <p style={{ maxWidth: 720, fontSize: 18, opacity: .82 }}>
          A browser-first Yu-Gi-Oh! simulator dedicated to the classic GOAT card pool, April 2005 banlist and period-correct rules.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
          <Link to="/lobby"><button>Enter Duel Lobby</button></Link>
          <Link to="/decks"><button>Build a Deck</button></Link>
        </div>
      </div>
    </motion.div>
  )
}
