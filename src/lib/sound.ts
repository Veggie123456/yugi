import { Howl } from 'howler'

type SoundKey = 'draw' | 'summon' | 'set' | 'attack' | 'direct' | 'shuffle' | 'click'

const sounds: Partial<Record<SoundKey, Howl>> = {}

export function initSounds(enabled: boolean) {
	if (!enabled) return
	const base = '/sfx'
	const create = (file: string) => new Howl({ src: [`${base}/${file}`], volume: 0.5 })
	sounds.draw = create('draw.mp3')
	sounds.summon = create('summon.mp3')
	sounds.set = create('set.mp3')
	sounds.attack = create('attack.mp3')
	sounds.direct = create('direct.mp3')
	sounds.shuffle = create('shuffle.mp3')
	sounds.click = create('click.mp3')
}

export function playSound(key: SoundKey, enabled: boolean) {
	if (!enabled) return
	try {
		sounds[key]?.play()
	} catch {
		// ignore missing assets during dev
	}
}


