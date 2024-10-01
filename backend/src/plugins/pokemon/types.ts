export type Team = { name: string; pokemon: Pokemon[] }

export const typings = [
  'Grass',
  'Poison',
  'Fire',
  'Water',
  'Electric',
  'Bug',
  'Rock',
  'Ground',
  'Ice',
  'Flying',
  'Psychic',
  'Normal',
  'Fighting',
  'Ghost',
  'Dark',
  'Fairy',
  'Steel',
  'Dragon',
] as const

export type Typings = (typeof typings)[number]

// TODO Type Pokemon is meant to hold additional stats, such as health, level, etc.
export type Pokemon = PokemonInfo & { hp: number }

export type PokemonInfo = { id: number; name: string; type: string[]; height: string; weight: string } & Partial<{
  num: string
  img: string
  candy: string
  candy_count: number
  egg: string
  spawn_chance: number
  avg_spawns: number
  spawn_time: string
  multipliers: number[] | null
  weaknesses: string[]
  prev_evolution: {
    num: string
    name: string
  }[]
  next_evolution: {
    num: string
    name: string
  }[]
}>

export type BattleEvent =
  | {
      pokemon: Pokemon
      value: number
      multiplier: number
      event: EVENT.Damage
    }
  | {
      pokemon: Pokemon
      event: EVENT.Attack
    }
  | {
      event: EVENT.Miss
    }
  | {
      pokemon: Pokemon
      event: EVENT.Faint
    }
  | {
      event: EVENT.Start
      team1: Team
      team2: Team
    }
  | {
      event: EVENT.Choose
      pokemon: Pokemon
      team: Team
    }
  | {
      event: EVENT.Victory
      team: Team
    }

export enum EVENT {
  Attack,
  Damage,
  Faint,
  Choose,
  Start,
  Victory,
  Miss,
}
