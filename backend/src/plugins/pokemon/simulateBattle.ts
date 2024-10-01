import { getEffectiveness } from './typeEffectivness'
import { BattleEvent, EVENT, Pokemon, Team, Typings } from './types'

// Simulate a pokemon battle between two teams
export const simulateBattle = (team1: Team, team2: Team): BattleEvent[] => {
  // Recursive function which alternates which pokemon/team will take its turn
  // Keeps going until a team wins, returning all battle events
  // Indices are used to keep track of which pokemon is in play for each team
  const simulateBattleRecursive = (index1: number, index2: number, t1: Team, t2: Team, events: BattleEvent[]) => {
    // Cloning since we will change these and don't want to work with side effects
    const pokemon2 = { ...t2.pokemon[index2] }
    const clonedT2 = { ...t2, pokemon: [...t2.pokemon] }

    const result = simulateAction(t1.pokemon[index1], pokemon2)
    events.push(...result)

    const damage = result.find((event) => event.event === EVENT.Damage)?.value ?? 0

    pokemon2.hp -= damage
    clonedT2.pokemon.splice(index2, 1, pokemon2)
    const hasFainted = pokemon2.hp <= 0
    const newIndex2 = hasFainted ? index2 + 1 : index2
    if (hasFainted) {
      events.push({ event: EVENT.Faint, pokemon: pokemon2 })
    }

    // t2 doesn't have any more pokemon, thus t1 has won
    if (!clonedT2.pokemon[newIndex2]) {
      events.push({
        event: EVENT.Victory,
        team: t1,
      })
      return events
    }

    if (hasFainted) {
      events.push({ event: EVENT.Choose, team: clonedT2, pokemon: clonedT2.pokemon[newIndex2] })
    }

    return simulateBattleRecursive(newIndex2, index1, clonedT2, t1, events)
  }

  const startingEvents: BattleEvent[] = [
    { event: EVENT.Start, team1, team2 },
    { event: EVENT.Choose, pokemon: team1.pokemon[0], team: team1 },
    { event: EVENT.Choose, pokemon: team2.pokemon[0], team: team2 },
  ]

  const events = simulateBattleRecursive(0, 0, team1, team2, startingEvents)
  return events
}

// Simulate a single action, where pokemon1 acts on pokemon2
const simulateAction = (pokemon1: Pokemon, pokemon2: Pokemon): BattleEvent[] => {
  // pokemon1 attacks pokemon2
  const events: BattleEvent[] = [{ event: EVENT.Attack, pokemon: pokemon1 }]
  // pokemon2 attempts to evade
  const evadeChance = calculateEvadeChance(pokemon2)
  const hit = Math.random() > evadeChance

  if (hit) {
    const { damage, multiplier } = calculateDamage(pokemon1, pokemon2)
    events.push({ event: EVENT.Damage, pokemon: pokemon2, value: damage, multiplier })
  } else {
    events.push({ event: EVENT.Miss })
  }

  return events
}

// Attack damage calculation function
const calculateDamage = (
  attacker: Pokemon,
  defender: Pokemon,
): {
  damage: number
  multiplier: number
} => {
  const baseDamage = 25

  const attackerWeight = parseFloat(attacker.weight)
  const defenderWeight = parseFloat(defender.weight)
  const attackerHeight = parseFloat(attacker.height)
  const defenderHeight = parseFloat(defender.height)

  // Get effectiveness of the attacker's type against the defender's type
  let typeMultiplier = 1
  attacker.type.forEach((attackingType) => {
    defender.type.forEach((defendingType) => {
      typeMultiplier *= getEffectiveness(attackingType as Typings, defendingType as Typings)
    })
  })

  // Calculate the damage
  // This can result in silly numbers when attacker is much larger than defender
  const damage =
    baseDamage *
    Math.sqrt(attackerWeight / defenderWeight) *
    Math.sqrt(attackerHeight / defenderHeight) *
    typeMultiplier

  return { damage: Math.floor(damage), multiplier: typeMultiplier }
}

// Evade calculation function
const calculateEvadeChance = (pokemon: Pokemon): number => {
  const avgHeight = 1.0 // avg height of all pokémon in meters
  const avgWeight = 45.0 // avg weight of all pokémon in kilograms
  const maxEvadeChance = 0.15 // 15% max evade chance
  const height = parseFloat(pokemon.height)
  const weight = parseFloat(pokemon.weight)

  // Base evade chance formula (smaller and lighter = higher chance)
  const evadeFactor = (height / avgHeight) * (weight / avgWeight)

  let evadeChance = 1 / evadeFactor
  evadeChance = Math.min(evadeChance * maxEvadeChance, maxEvadeChance)

  return evadeChance
}

// Generate battle logs from the result of a battle simulation
export const generateBattleLogs = (result: BattleEvent[]): string[] => {
  return result.flatMap((event) => {
    switch (event.event) {
      case EVENT.Start:
        return [`${event.team1.name} VS ${event.team2.name}`, `Battle starts!`, '']

      case EVENT.Choose: {
        const pokemonLeft = event.team.pokemon.filter((pokemon) => pokemon.hp > 0).length
        return [
          `${event.team.name} has ${pokemonLeft} Pokémon left`,
          `${event.team.name} chooses ${event.pokemon.name}!`,
          '',
        ]
      }
      case EVENT.Attack:
        return `${event.pokemon.name} attacks`

      case EVENT.Miss:
        return `The attack missed!`

      case EVENT.Damage: {
        const superEffective = event.multiplier > 1 ? `supereffective (${event.multiplier}) ` : ''
        const notVeryEffective = event.multiplier < 1 ? `not very effective (${event.multiplier}) ` : ''
        const modifier = superEffective + notVeryEffective
        return `${event.pokemon.name} took ${event.value} ${modifier}damage`
      }
      case EVENT.Faint:
        return ['', `${event.pokemon.name} fainted`]

      case EVENT.Victory:
        return ['', `${event.team.name} won!`]

      default:
        return 'An unexpected action was taken'
    }
  })
}
