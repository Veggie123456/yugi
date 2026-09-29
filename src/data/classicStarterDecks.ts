import type { CardData } from '../types/card'

export type StarterDeckId = 'yugi' | 'kaiba' | 'joey' | 'pegasus'

export interface ClassicStarterDeck {
  id: StarterDeckId
  character: string
  title: string
  year: number
  coverCard: string
  accent: string
  cardNames: string[]
  fusionNames?: string[]
}

export const CLASSIC_STARTER_DECKS: ClassicStarterDeck[] = [
  {
    id: 'yugi',
    character: 'Yugi',
    title: 'Starter Deck: Yugi',
    year: 2002,
    coverCard: 'Dark Magician',
    accent: '#8f6cff',
    cardNames: [
      'Mystical Elf','Feral Imp','Winged Dragon, Guardian of the Fortress #1','Summoned Skull','Beaver Warrior',
      'Dark Magician','Gaia The Fierce Knight','Curse of Dragon','Celtic Guardian','Mammoth Graveyard','Great White',
      'Silver Fang','Giant Soldier of Stone','Dragon Zombie','Doma The Angel of Silence','Ansatsu','Witty Phantom',
      'Claw Reacher','Mystic Clown','Sword of Dark Destruction','Book of Secret Arts','Dark Hole','Dian Keto the Cure Master',
      'Ancient Elf','Magical Ghost','Fissure','Trap Hole','Two-Pronged Attack','De-Spell','Monster Reborn','Reinforcements',
      'Change of Heart','The Stern Mystic','Wall of Illusion','Neo the Magic Swordsman','Baron of the Fiend Sword',
      'Man-Eating Treasure Chest','Sorcerer of the Doomed','Last Will','Waboku','Soul Exchange','Card Destruction',
      'Trap Master','Dragon Capture Jar','Yami','Man-Eater Bug','Reverse Trap','Remove Trap','Castle Walls','Ultimate Offering'
    ]
  },
  {
    id: 'kaiba',
    character: 'Kaiba',
    title: 'Starter Deck: Kaiba',
    year: 2002,
    coverCard: 'Blue-Eyes White Dragon',
    accent: '#5aa8ff',
    cardNames: [
      'Blue-Eyes White Dragon','Hitotsu-Me Giant','Ryu-Kishin','The Wicked Worm Beast','Battle Ox','Koumori Dragon',
      'Judge Man','Rogue Doll','Kojikocy','Uraby','Gyakutenno Megami','Mystic Horseman','Terra the Terrible',
      'Dark Titan of Terror','Dark Assailant','Master & Expert','Unknown Warrior of Fiend','Mystic Clown',
      'Ogre of the Black Shadow','Dark Energy','Invigoration','Dark Hole','Ookazi','Ryu-Kishin Powered','Swordstalker',
      'La Jinn the Mystical Genie of the Lamp','Rude Kaiser','Destroyer Golem','Skull Red Bird','D. Human','Pale Beast',
      'Fissure','Trap Hole','Two-Pronged Attack','De-Spell','Monster Reborn','The Inexperienced Spy','Reinforcements',
      'Ancient Telescope','Just Desserts','Lord of D.','The Flute of Summoning Dragon','Mysterious Puppeteer','Trap Master',
      'Sogen','Hane-Hane','Reverse Trap','Remove Trap','Castle Walls','Ultimate Offering'
    ]
  },
  {
    id: 'joey',
    character: 'Joey',
    title: 'Starter Deck: Joey',
    year: 2003,
    coverCard: 'Red-Eyes Black Dragon',
    accent: '#ff6c5f',
    fusionNames: ['Thousand Dragon','Flame Swordsman'],
    cardNames: [
      'Red-Eyes Black Dragon','Swordsman of Landstar','Baby Dragon','Spirit of the Harp','Island Turtle','Flame Manipulator',
      'Masaki the Legendary Swordsman','7 Colored Fish','Armored Lizard','Darkfire Soldier #1','Sky Scout',
      'Gearfried the Iron Knight','Karate Man','Milus Radiant','Time Wizard','Maha Vailo','Magician of Faith','Big Eye',
      'Sangan','Princess of Tsurugi','White Magical Hat','Penguin Soldier','Thousand Dragon','Flame Swordsman',
      'Malevolent Nuzzler','Dark Hole','Dian Keto the Cure Master','Fissure','De-Spell','Change of Heart','Block Attack',
      'Giant Trunade','The Reliable Guardian','Remove Trap','Monster Reborn','Polymerization','Mountain','Dragon Treasure',
      'Eternal Rest','Shield & Sword','Scapegoat','Just Desserts','Trap Hole','Reinforcements','Castle Walls','Waboku',
      'Ultimate Offering','Seven Tools of the Bandit','Fake Trap','Reverse Trap'
    ]
  },
  {
    id: 'pegasus',
    character: 'Pegasus',
    title: 'Starter Deck: Pegasus',
    year: 2003,
    coverCard: 'Relinquished',
    accent: '#ff82c8',
    cardNames: [
      'Relinquished','Red Archery Girl','Ryu-Ran','Illusionist Faceless Mage','Rogue Doll','Uraby','Giant Soldier of Stone',
      'Aqua Madoor','Toon Alligator','Hane-Hane','Sonic Bird','Jigen Bakudan','Mask of Darkness','Witch of the Black Forest',
      'Man-Eater Bug','Muka Muka','Dream Clown','Armed Ninja',"Hiro's Shadow Scout",'Blue-Eyes Toon Dragon',
      'Toon Summoned Skull','Manga Ryu-Ran','Toon Mermaid','Toon World','Black Pendant','Dark Hole','Dian Keto the Cure Master',
      'Fissure','De-Spell','Change of Heart','Stop Defense','Mystical Space Typhoon','Rush Recklessly','Remove Trap',
      'Monster Reborn','Soul Release','Yami','Black Illusion Ritual','Ring of Magnetism','Graceful Charity','Trap Hole',
      'Reinforcements','Castle Walls','Waboku','Seven Tools of the Bandit','Ultimate Offering',"Robbin' Goblin",
      'Magic Jammer','Enchanted Javelin','Gryphon Wing'
    ]
  }
]

export function buildClassicStarterDeck(cards: CardData[], id: StarterDeckId) {
  const preset = CLASSIC_STARTER_DECKS.find((deck) => deck.id === id)
  if (!preset) return { preset: undefined, main: [], fusion: [], side: [], missing: [] as string[] }

  const byName = new Map(cards.map((card) => [card.name, card]))
  const fusionSet = new Set(preset.fusionNames ?? [])
  const missing: string[] = []
  const main: CardData[] = []
  const fusion: CardData[] = []

  for (const name of preset.cardNames) {
    const card = byName.get(name)
    if (!card) {
      missing.push(name)
      continue
    }
    if (fusionSet.has(name)) fusion.push(card)
    else main.push(card)
  }

  return { preset, main, fusion, side: [] as CardData[], missing }
}
