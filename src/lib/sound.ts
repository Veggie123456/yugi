import { Howl } from 'howler'

export type SoundKey = 'draw' | 'summon' | 'set' | 'attack' | 'direct' | 'shuffle' | 'click' | 'phase' | 'chain' | 'damage'

const sounds: Partial<Record<SoundKey, Howl>> = {}
let initialized = false
let audioContext: AudioContext | null = null

const soundFiles: Record<SoundKey, string> = {
	draw: 'draw.mp3',
	summon: 'summon.mp3',
	set: 'set.mp3',
	attack: 'attack.mp3',
	direct: 'direct.mp3',
	shuffle: 'shuffle.mp3',
	click: 'click.mp3',
	phase: 'phase.mp3',
	chain: 'chain.mp3',
	damage: 'damage.mp3',
}

export function initSounds(enabled: boolean) {
	if (!enabled || initialized) return
	initialized = true
	for (const [key, file] of Object.entries(soundFiles) as [SoundKey, string][]) {
		sounds[key] = new Howl({ src: [`/sfx/${file}`], volume: 0.45, preload: true })
	}
}

function synthSound(key: SoundKey) {
	try {
		audioContext ??= new AudioContext()
		const now = audioContext.currentTime
		const oscillator = audioContext.createOscillator()
		const gain = audioContext.createGain()
		const frequencies: Record<SoundKey, number> = {
			draw: 660,
			summon: 220,
			set: 330,
			attack: 120,
			direct: 95,
			shuffle: 460,
			click: 520,
			phase: 760,
			chain: 880,
			damage: 150,
		}
		oscillator.type = key === 'attack' || key === 'damage' ? 'sawtooth' : 'sine'
		oscillator.frequency.setValueAtTime(frequencies[key], now)
		oscillator.frequency.exponentialRampToValueAtTime(Math.max(70, frequencies[key] * 0.72), now + 0.09)
		gain.gain.setValueAtTime(0.0001, now)
		gain.gain.exponentialRampToValueAtTime(0.08, now + 0.008)
		gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1)
		oscillator.connect(gain)
		gain.connect(audioContext.destination)
		oscillator.start(now)
		oscillator.stop(now + 0.11)
	} catch {
		// Browsers may block audio until the user interacts with the page.
	}
}

export function playSound(key: SoundKey, enabled: boolean) {
	if (!enabled) return
	initSounds(true)
	const sound = sounds[key]
	if (sound?.state() === 'loaded') {
		sound.play()
		return
	}
	// Every action has an audible fallback even before custom MP3 assets exist.
	synthSound(key)
}
