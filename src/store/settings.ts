import { create } from 'zustand'
import { defaultGoatRules } from '../config/goat'
import type { GoatRulesConfig } from '../types/rules'

interface SettingsState {
	goatRules: GoatRulesConfig
	soundsEnabled: boolean
	animationsEnabled: boolean
	setGoatRules: (rules: GoatRulesConfig) => void
	setSoundsEnabled: (enabled: boolean) => void
	setAnimationsEnabled: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
	goatRules: defaultGoatRules,
	soundsEnabled: true,
	animationsEnabled: true,
	setGoatRules: (rules) => set({ goatRules: rules }),
	setSoundsEnabled: (enabled) => set({ soundsEnabled: enabled }),
	setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
}))
