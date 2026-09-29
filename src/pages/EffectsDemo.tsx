import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { CardData } from '../types/card'
import { loadAllCards } from '../lib/cards'
import Card from '../components/Card'
import { playSound } from '../lib/sound'
import { useSettingsStore } from '../store/settings'

type Demo = 'summon' | 'spell' | 'chain' | 'attack' | 'flip'

const demoCards: Record<Demo, string[]> = {
  summon: ['Dark Magician'],
  spell: ['Pot of Greed'],
  chain: ['Mystical Space Typhoon', 'Mirror Force'],
  attack: ['Summoned Skull', 'La Jinn the Mystical Genie of the Lamp'],
  flip: ['Man-Eater Bug']
}

export default function EffectsDemo() {
  const soundsEnabled = useSettingsStore((state) => state.soundsEnabled)
  const [cards, setCards] = useState<CardData[]>([])
  const [demo, setDemo] = useState<Demo>('summon')
  const [run, setRun] = useState(0)

  useEffect(() => { loadAllCards().then(setCards) }, [])

  const getCard = (name: string) => cards.find((card) => card.name === name)

  function play(next: Demo) {
    setDemo(next)
    setRun((value) => value + 1)
    if (next === 'summon') playSound('summon', soundsEnabled)
    if (next === 'spell') playSound('chain', soundsEnabled)
    if (next === 'chain') playSound('chain', soundsEnabled)
    if (next === 'attack') playSound('attack', soundsEnabled)
    if (next === 'flip') playSound('click', soundsEnabled)
  }

  const primary = getCard(demoCards[demo][0])
  const secondary = demoCards[demo][1] ? getCard(demoCards[demo][1]) : undefined

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-stack">
      <div className="page-heading">
        <div>
          <div className="eyebrow">ANIMATION SYSTEM PREVIEW</div>
          <h1>Card Effects</h1>
          <p>
            Universal readable effects first: every card gets movement, glow, chain, targeting, damage and sound feedback.
            Iconic cards can later get optional premium character-style summon animations.
          </p>
        </div>
        <div className="engine-badge">Prototype visual language</div>
      </div>

      <div className="effect-demo-tabs">
        <button onClick={() => play('summon')}>Summon</button>
        <button onClick={() => play('spell')}>Spell</button>
        <button onClick={() => play('chain')}>Chain</button>
        <button onClick={() => play('attack')}>Attack</button>
        <button onClick={() => play('flip')}>Flip Effect</button>
      </div>

      <section className="panel effect-stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${demo}-${run}`}
            className={`effect-scene effect-${demo}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {demo === 'summon' && primary && (
              <>
                <motion.div
                  initial={{ y: 110, opacity: 0, scale: .75, rotateX: 55 }}
                  animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 14 }}
                  className="effect-card-focus summon-focus"
                >
                  <Card card={primary} />
                </motion.div>
                <motion.div
                  className="summon-ring"
                  initial={{ scale: .2, opacity: 0 }}
                  animate={{ scale: [0.2, 1.15, 1.7], opacity: [0, .9, 0] }}
                  transition={{ duration: .9 }}
                />
                <motion.strong initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35 }}>
                  NORMAL SUMMON · {primary.name}
                </motion.strong>
              </>
            )}

            {demo === 'spell' && primary && (
              <>
                <motion.div
                  className="effect-card-focus"
                  initial={{ scale: .72, opacity: 0, rotate: -8 }}
                  animate={{ scale: [0.72, 1.06, 1], opacity: 1, rotate: 0 }}
                  transition={{ duration: .48 }}
                >
                  <Card card={primary} />
                </motion.div>
                <motion.div className="spell-burst" initial={{ scale: .2, opacity: 0 }} animate={{ scale: 1.7, opacity: [0, .8, 0] }} transition={{ duration: .8 }} />
                <motion.div className="effect-caption" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .28 }}>
                  <strong>{primary.name}</strong>
                  <span>ACTIVATE · Draw 2 cards</span>
                </motion.div>
                <div className="draw-ghosts">
                  {[0,1].map((index) => (
                    <motion.div
                      key={index}
                      className="mini-card-back"
                      initial={{ x: 0, y: 0, opacity: 0 }}
                      animate={{ x: 150 + index * 34, y: 55 - index * 18, opacity: [0, 1, 0] }}
                      transition={{ delay: .34 + index * .12, duration: .7 }}
                    />
                  ))}
                </div>
              </>
            )}

            {demo === 'chain' && primary && secondary && (
              <>
                <motion.div className="chain-card chain-one" initial={{ x: -90, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <Card card={primary} />
                  <span>CHAIN 1</span>
                </motion.div>
                <motion.div className="chain-links" initial={{ scale: .5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: .18 }}>
                  <span>◉</span><span>◉</span><span>◉</span>
                </motion.div>
                <motion.div className="chain-card chain-two" initial={{ x: 90, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: .2 }}>
                  <Card card={secondary} />
                  <span>CHAIN 2</span>
                </motion.div>
                <motion.strong className="chain-resolve" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .5 }}>
                  RESOLVE BACKWARDS
                </motion.strong>
              </>
            )}

            {demo === 'attack' && primary && secondary && (
              <>
                <motion.div className="battle-card attacker" initial={{ x: -110 }} animate={{ x: [-110, -30, 25, -30] }} transition={{ duration: .72 }}>
                  <Card card={primary} />
                  <span>{primary.attack ?? 0} ATK</span>
                </motion.div>
                <motion.div className="attack-slash" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: [0, 1, 1.1], opacity: [0, 1, 0] }} transition={{ delay: .28, duration: .34 }} />
                <motion.div className="battle-card defender" initial={{ x: 110 }} animate={{ x: [110, 110, 125, 110] }} transition={{ delay: .34, duration: .32 }}>
                  <Card card={secondary} />
                  <span>{secondary.attack ?? 0} ATK</span>
                </motion.div>
                <motion.div className="damage-number" initial={{ scale: .4, opacity: 0 }} animate={{ scale: [0.4, 1.25, 1], opacity: 1 }} transition={{ delay: .42 }}>
                  -{Math.max(0, (primary.attack ?? 0) - (secondary.attack ?? 0))} LP
                </motion.div>
              </>
            )}

            {demo === 'flip' && primary && (
              <>
                <motion.div className="effect-card-focus flip-card-demo" initial={{ rotateY: 180 }} animate={{ rotateY: 0 }} transition={{ duration: .55 }}>
                  <Card card={primary} />
                </motion.div>
                <motion.div className="effect-caption" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4 }}>
                  <strong>FLIP EFFECT</strong>
                  <span>Select and destroy 1 monster</span>
                </motion.div>
                <motion.div className="target-reticle" initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: [0, 1, .6] }} transition={{ delay: .48 }} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      <div className="panel effect-notes">
        <strong>Direction</strong>
        <span>Fast enough for competitive play, flashy enough to feel like an actual game.</span>
        <span>Animations can be reduced or disabled in Settings.</span>
        <span>Sounds use shared action cues so all 1,700+ cards feel consistent without requiring 1,700 custom audio files.</span>
      </div>
    </motion.div>
  )
}
