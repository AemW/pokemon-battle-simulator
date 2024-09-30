export type Team = { name: string; pkms: Pkm[] }
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
// TODO Type Pkm is meant to hold additional stats, such as health, level, etc.
export type Pkm = PkmInfo & { hp: number }
export type PkmInfo = { id: number; name: string; type: string[]; height: string; weight: string } & Partial<{
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
      pkm: Pkm
      value: number
      event: EVENT.Damage
    }
  | {
      pkm: Pkm
      event: EVENT.Attack
    }
  | {
      event: EVENT.Miss
    }
  | {
      pkm: Pkm
      event: EVENT.Faint
    }
  | {
      event: EVENT.Turn
    }
  | {
      event: EVENT.Start
    }
  | {
      event: EVENT.Turn
      pkm: Pkm
    }
  | {
      event: EVENT.Choose
      pkm: Pkm
      team: string
    }
  | {
      event: EVENT.Victory
      team: Team
    }
export enum EVENT {
  Attack,
  Damage,
  Faint,
  Turn,
  Choose,
  Start,
  Victory,
  Miss,
}
