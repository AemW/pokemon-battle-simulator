import { badImplementation, badRequest, notFound } from '@hapi/boom'
import Hapi from '@hapi/hapi'
import Joi from 'joi'
import * as data from './pkmData.json'

const pkmPlugin: Hapi.Plugin<undefined> = {
  name: 'pkmPlugin',
  register: async (server: Hapi.Server) => {
    server.route([
      {
        method: 'GET',
        path: '/pkm/list',
        // Return all available pkm
        handler: (request: Hapi.Request): PkmInfo[] => {
          try {
            return data.pokemon
          } catch (error) {
            request.log('error', error as Error)
            throw badImplementation('Failed to get pokemon')
          }
        },
        options: {
          description: 'GET /pkm',
          notes: 'Get all pokemon',
          tags: ['api'],
        },
      },
      {
        method: 'GET',
        path: '/pkm/{id}',
        // Return a specific pkm, by id
        handler: (request: Hapi.Request): PkmInfo => {
          try {
            const pokemon = data.pokemon.find((pkm) => pkm.id === request.params.id)
            if (!pokemon) {
              throw notFound('Could not find requested pokemon')
            }
            return pokemon
          } catch (error) {
            request.log('error', error as Error)
            throw badImplementation('Failed to get pokemon')
          }
        },
        options: {
          description: 'GET /pkm/{id}',
          notes: 'Get a single pokemon by its id',
          tags: ['api'],
          response: {
            schema: Joi.object({
              id: Joi.number().required(),
              name: Joi.string().required(),
            }),
          },
          validate: {
            params: Joi.object({
              id: Joi.number().min(1).max(151),
            }),
            failAction: (_request, _h, err) => {
              throw badRequest(err?.message ?? 'Validation failure')
            },
          },
        },
      },
    ])

    // Separate route due to issues with request typing
    server.route([
      {
        method: 'POST',
        path: '/pkm/simulate',
        handler: (request: Hapi.Request<{ Payload: { team1: Team; team2: Team } }>): string[] => {
          try {
            const {
              payload: { team1, team2 },
            } = request

            return generateBattleLogs(simulateBattle(team1, team2))
          } catch (error) {
            request.log('error', error as Error)
            throw badImplementation('Simulation failure')
          }
        },
        options: {
          description: 'POST /pkm/simulate',
          notes: 'Simulate a battle between two teams, returning the logs of the battle',
          tags: ['api'],
          response: { schema: Joi.array().items(Joi.string()) },
          validate: {
            payload: Joi.object({
              team1: TeamSchema,
              team2: TeamSchema,
            }),
            failAction: (_request, _h, err) => {
              throw badRequest(err?.message ?? 'Validation failure')
            },
          },
        },
      },
    ])
  },
}

export default pkmPlugin

// TODO somehow generate from types?
const TeamSchema = Joi.object({
  name: Joi.string().required(),
  pkms: Joi.array()
    .items(
      Joi.object({
        order: Joi.number().required(),
        id: Joi.number().required(),
        name: Joi.string().required(),
      }),
    )
    .required(),
})

// TODO move to types folder
type Team = { name: string; pkms: Pkm[] }
// TODO remove order
type Pkm = PkmInfo & { order: number }
type PkmInfo = { id: number; name: string } & Partial<{
  num: string
  img: string
  type: string[]
  height: string
  weight: string
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
type BattleResult = { events: BattleEvent[]; winner: Team }
type BattleEvent = {
  pkm: Pkm
  event: EVENT
}
enum EVENT {
  Attack,
  Damage,
  Faint,
}

// Simulate a pkm battle between two teams
const simulateBattle = (team1: Team, team2: Team): BattleResult => {
  const pkm1: Pkm = team1.pkms[0]
  const pkm2: Pkm = team2.pkms[0]

  const events: BattleEvent[] = []

  // Recursive function which alternates which pkm will take its turn
  // Keeps going until a team wins, and returns that team
  // TODO make 'events' part of the recursion return value?
  const simulateBattleRecursive = (p1: Pkm, p2: Pkm, t1: Team, t2: Team): Team => {
    const result = simulateAction(p1, p2)
    const hasFainted = result.some((event) => event.event === EVENT.Faint)
    events.push(...result)
    const nextP2 = hasFainted ? t2.pkms[p2.order + 1] : p2

    // t2 doesn't have any more pkm, thus t1 has won
    if (!nextP2) return t1

    return simulateBattleRecursive(nextP2, p1, t2, t1)
  }

  const winner = simulateBattleRecursive(pkm1, pkm2, team1, team2)
  return { events, winner }
}

// Simulate a single action, where pkm1 acts on pkm2
// Very simple logic
const simulateAction = (pkm1: Pkm, pkm2: Pkm): BattleEvent[] => {
  // TODO type matrix, damge calc, crit, evade?
  const decider = Math.random() * 100
  // pkm1 attacks pkm2, pkm2 takes damage
  const events = [
    { event: EVENT.Attack, pkm: pkm1 },
    { event: EVENT.Damage, pkm: pkm2 },
  ]

  // 50/50 chance of fainting the hurt pkm
  if (decider >= 50) {
    events.push({ event: EVENT.Faint, pkm: pkm2 })
  }
  return events
}

// Generate battle logs from the result of a battle simulation
// TODO prettify the logs, signal turn changes, add battle intro
const generateBattleLogs = (result: BattleResult): string[] => {
  return result.events
    .map((event) => {
      switch (event.event) {
        case EVENT.Attack:
          return `${event.pkm.name} attacks`

        case EVENT.Damage:
          return `${event.pkm.name} took damage`

        case EVENT.Faint:
          return `${event.pkm.name} fainted`

        default:
          return 'An unexpected action was taken'
      }
    })
    .concat(`Team ${result.winner.name} won!`)
}
