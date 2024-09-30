// simulateBattle.test.ts
import { generateBattleLogs, simulateBattle } from '../src/plugins/pokemon/simulateBattle'
import { BattleEvent, EVENT, Team } from '../src/plugins/pokemon/types'

const mockTeam1: Team = {
  name: 'Team 1',
  pokemon: [
    {
      hp: 100,
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      height: '0.71 m',
      weight: '6.9 kg',
    },
    {
      hp: 100,
      id: 2,
      name: 'Ivysaur',
      type: ['Grass', 'Poison'],
      height: '0.99 m',
      weight: '13.0 kg',
    },
  ],
}

const mockTeam2: Team = {
  name: 'Team 2',
  pokemon: [
    {
      hp: 100,
      id: 3,
      name: 'Charmander',
      type: ['Fire'],
      height: '0.61 m',
      weight: '8.5 kg',
    },
    {
      hp: 100,
      id: 4,
      name: 'Charmeleon',
      type: ['Fire'],
      height: '1.09 m',
      weight: '19.0 kg',
    },
  ],
}

describe('simulateBattle', () => {
  test('should return battle events and a victory event', () => {
    const battleEvents = simulateBattle(mockTeam1, mockTeam2)
    expect(battleEvents.length).toBeGreaterThan(3) // start, 2 x choose, victory
    const victoryEvent = battleEvents.find((event) => event.event === EVENT.Victory)
    expect(victoryEvent).toBeDefined()
  })

  test('should handle fainting correctly', () => {
    const battleEvents = simulateBattle(mockTeam1, mockTeam2)
    const faintEvents = battleEvents.filter((event) => event.event === EVENT.Faint)
    expect(faintEvents.length).toBeGreaterThanOrEqual(2) // an entire team must faint to finish battle
  })
})

describe('generateBattleLogs', () => {
  const mockEvents: BattleEvent[] = [
    { event: EVENT.Start, team1: mockTeam1, team2: mockTeam2 },
    {
      event: EVENT.Choose,
      team: mockTeam1,
      pokemon: {
        hp: 100,
        id: 1,
        name: 'Bulbasaur',
        type: ['Grass', 'Poison'],
        height: '0.71 m',
        weight: '6.9 kg',
      },
    },
    {
      event: EVENT.Choose,
      team: mockTeam2,
      pokemon: {
        hp: 100,
        id: 3,
        name: 'Charmander',
        type: ['Fire'],
        height: '0.61 m',
        weight: '8.5 kg',
      },
    },
    {
      event: EVENT.Attack,
      pokemon: {
        hp: 100,
        id: 1,
        name: 'Bulbasaur',
        type: ['Grass', 'Poison'],
        height: '0.71 m',
        weight: '6.9 kg',
      },
    },
    {
      event: EVENT.Damage,
      pokemon: {
        hp: 100,
        id: 3,
        name: 'Charmander',
        type: ['Fire'],
        height: '0.61 m',
        weight: '8.5 kg',
      },
      value: 100,
    },
    {
      event: EVENT.Faint,
      pokemon: {
        hp: 100,
        id: 3,
        name: 'Charmander',
        type: ['Fire'],
        height: '0.61 m',
        weight: '8.5 kg',
      },
    },
    { event: EVENT.Victory, team: { name: 'Team 1', pokemon: [] } },
  ]

  test('should generate readable logs from battle events', () => {
    const logs = generateBattleLogs(mockEvents)
    expect(logs[0]).toBe(`${mockTeam1.name} VS ${mockTeam2.name}`)
    expect(logs[logs.length - 1]).toBe('Team 1 won!')
  })
})
