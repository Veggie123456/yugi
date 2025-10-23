export interface GoatRulesConfig {
	cutoffDateIso: string
	// Allow/deny by release containers
	allowedSetCodes: string[]
	allowedPromoPrefixes: string[]
	disallowedSetPrefixes?: string[]
	disallowedMechanics?: string[]
	// Banlist
	banlist: {
		forbidden: string[]
		limited: string[]
		semiLimited: string[]
	}
	// Other constraints
	allowListOverrides?: string[]
}


