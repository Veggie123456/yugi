import { create } from 'zustand'

interface MatchState {
	game: 1 | 2 | 3
	score: [number, number]
	inSiding: boolean
	startSiding: () => void
	endSiding: () => void
	winGame: (seat: 0 | 1) => void
}

export const useMatchStore = create<MatchState>((set) => ({
	game: 1,
	score: [0, 0],
	inSiding: false,
	startSiding: () => set({ inSiding: true }),
	endSiding: () => set((s) => ({ inSiding: false, game: (s.game + 1) as 1|2|3 })),
	winGame: (seat) => set((s) => {
		const score = [...s.score] as [number, number]
		score[seat] += 1
		return { score }
	})
}))



