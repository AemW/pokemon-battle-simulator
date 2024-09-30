import { getEffectiveness } from './typeEffectivness'
import { BattleEvent, EVENT, Pkm, Team, Typings } from './types'

// Simulate a pkm battle between two teams
export const simulateBattle = (team1: Team, team2: Team): BattleEvent[] => {
  // Recursive function which alternates which pkm will take its turn
  // Keeps going until a team wins, returning all battle events
  const simulateBattleRecursive = (index1: number, index2: number, t1: Team, t2: Team, events: BattleEvent[]) => {
    const pokemon1 = t1.pkms[index1]
    const pokemon2 = t2.pkms[index2]
    const result = simulateAction(pokemon1, pokemon2)

    const damage = result.find((event) => event.event === EVENT.Damage)?.value ?? 0
    const hasFainted = result.some((event) => event.event === EVENT.Faint)

    pokemon2.hp -= damage
    t2.pkms.splice(index2, 1, pokemon2)

    events.push(...result)
    const newIndex2 = hasFainted ? index2 + 1 : index2

    // t2 doesn't have any more pkm, thus t1 has won
    if (!t2.pkms[newIndex2]) {
      events.push({
        event: EVENT.Victory,
        team: t1,
      })
      return events
    }

    if (hasFainted) {
      events.push({ event: EVENT.Choose, team: t2.name, pkm: t2.pkms[newIndex2] })
    }

    return simulateBattleRecursive(newIndex2, index1, t2, t1, events)
  }

  const startingEvents: BattleEvent[] = [
    { event: EVENT.Start },
    { event: EVENT.Choose, pkm: team1.pkms[0], team: team1.name },
    { event: EVENT.Choose, pkm: team2.pkms[0], team: team2.name },
  ]

  const events = simulateBattleRecursive(0, 0, team1, team2, startingEvents)
  return events
}

// Simulate a single action, where pkm1 acts on pkm2
// Very simple logic
const simulateAction = (pkm1: Pkm, pkm2: Pkm): BattleEvent[] => {
  // pkm1 attacks pkm2
  const events: BattleEvent[] = [{ event: EVENT.Attack, pkm: pkm1 }]
  const damage = calculateDamage(pkm1, pkm2)
  const evadeChance = calculateEvadeChance(pkm2)
  const hit = Math.random() > evadeChance

  if (hit) {
    events.push({ event: EVENT.Damage, pkm: pkm2, value: damage })
  } else {
    events.push({ event: EVENT.Miss })
  }

  if (hit && pkm2.hp - damage <= 0) {
    events.push({ event: EVENT.Faint, pkm: pkm2 })
  }
  return events
}

// Attack damage calculation function
const calculateDamage = (attacker: Pkm, defender: Pkm) => {
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
  // This can result in some silly damage when attacker is much bigger than defender
  const damage =
    baseDamage *
    Math.sqrt(attackerWeight / defenderWeight) *
    Math.sqrt(attackerHeight / defenderHeight) *
    typeMultiplier

  return Math.floor(damage)
}

// Evade calculation function
const calculateEvadeChance = (pokemon: Pkm) => {
  const avgHeight = 1.0 // in meters
  const avgWeight = 45.0 // in kilograms
  const maxEvadeChance = 0.15 // 15% max evade chance
  const height = parseFloat(pokemon.height)
  const weight = parseFloat(pokemon.weight)

  // Base evade chance formula (smaller and lighter = higher chance)
  const evadeFactor = (height / avgHeight) * (weight / avgWeight)

  let evadeChance = 1 / evadeFactor

  evadeChance = Math.min(evadeChance * maxEvadeChance, maxEvadeChance)
  console.log(pokemon.name, evadeChance * maxEvadeChance, evadeChance)

  return evadeChance
}

// Generate battle logs from the result of a battle simulation
// TODO prettify the logs
export const generateBattleLogs = (result: BattleEvent[]): string[] => {
  return result.map((event) => {
    switch (event.event) {
      case EVENT.Start:
        return `Battle starts!`

      case EVENT.Turn:
        return `A new turn begins`

      case EVENT.Choose:
        return `${event.team} chooses ${event.pkm.name}!`

      case EVENT.Attack:
        return `${event.pkm.name} attacks`

      case EVENT.Miss:
        return `The attack missed!`

      case EVENT.Damage:
        return `${event.pkm.name} took ${event.value} damage`

      case EVENT.Faint:
        return `${event.pkm.name} fainted`

      case EVENT.Victory:
        return `${event.team.name} won!`

      default:
        return 'An unexpected action was taken'
    }
  })
}
