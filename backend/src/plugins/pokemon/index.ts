import { badImplementation, badRequest, notFound } from '@hapi/boom'
import Hapi from '@hapi/hapi'
import Joi from 'joi'
import data from './pkmData.json'
import { generateBattleLogs, simulateBattle } from './simulateBattle'
import { PokemonInfo, typings } from './types'

// Plugin, routes, and validators
const pokemonPlugin: Hapi.Plugin<undefined> = {
  name: 'pokemonPlugin',
  register: async (server: Hapi.Server) => {
    server.route([
      {
        method: 'GET',
        path: '/pokemon/list',
        // Return all available pokemon
        handler: (request: Hapi.Request): PokemonInfo[] => {
          try {
            return data.pokemon
          } catch (error) {
            request.log('error', error as Error)
            throw badImplementation('Failed to get pokemon')
          }
        },
        options: {
          description: 'GET /pokemon',
          notes: 'Get all pokemon',
          response: { schema: Joi.array().items(pokemonSchema) },
          tags: ['api'],
        },
      },
      {
        method: 'GET',
        path: '/pokemon/{id}',
        // Return a specific pokemon, by id
        handler: (request: Hapi.Request): PokemonInfo => {
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
          description: 'GET /pokemon/{id}',
          notes: 'Get a single pokemon by its id',
          tags: ['api'],
          response: {
            schema: pokemonSchema,
          },
          validate: {
            params: Joi.object({
              id: idSchema,
            }),
            failAction: (_request, _h, err) => {
              throw badRequest(err?.message ?? 'Validation failure')
            },
          },
        },
      },
    ])

    // Separate route due to issues with request (payload) typing
    server.route([
      {
        method: 'POST',
        path: '/pokemon/simulate',
        handler: (
          request: Hapi.Request<{
            Payload: { team1: { name: string; pokemon: number[] }; team2: { name: string; pokemon: number[] } }
          }>,
        ): string => {
          try {
            const {
              payload: { team1, team2 },
            } = request

            // Fill pokemon data from id lists
            const t1 = { name: team1.name, pokemon: team1.pokemon.map((id) => ({ ...data.pokemon[id - 1], hp: 100 })) }
            const t2 = { name: team2.name, pokemon: team2.pokemon.map((id) => ({ ...data.pokemon[id - 1], hp: 100 })) }

            const logs = generateBattleLogs(simulateBattle(t1, t2))
            return logs.join('\n')
          } catch (error) {
            request.log('error', error as Error)
            throw badImplementation('Simulation failure')
          }
        },
        options: {
          description: 'POST /pokemon/simulate',
          notes: 'Simulate a battle between two teams, returning the logs of the battle',
          tags: ['api'],
          response: { schema: Joi.string() },
          validate: {
            payload: Joi.object({
              team1: teamSchema,
              team2: teamSchema,
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

export default pokemonPlugin

// Validation schemas for the API

const idSchema = Joi.number().required().min(1).max(data.pokemon.length)

const teamSchema = Joi.object({
  name: Joi.string().required(),
  pokemon: Joi.array().items(idSchema).required(),
})

const typeSchema = Joi.string().valid(...typings)

const pokemonSchema = Joi.object({
  id: Joi.number().integer().required(),
  num: Joi.string().required(),
  name: Joi.string().required(),
  img: Joi.string().uri().required(),
  type: Joi.array().items(typeSchema).min(1).required(),
  height: Joi.string()
    .pattern(/^[0-9.]+\s?m$/)
    .required(),
  weight: Joi.string()
    .pattern(/^[0-9.]+\s?kg$/)
    .required(),
  candy: Joi.string().required(),
  candy_count: Joi.number().integer().optional(),
  egg: Joi.string().valid('Not in Eggs', '2 km', '5 km', '10 km').required(),
  spawn_chance: Joi.number().required(),
  avg_spawns: Joi.number().required(),
  spawn_time: Joi.string()
    .pattern(/^\d{2}:\d{2}$|^N\/A$/)
    .required(),
  multipliers: Joi.array().items(Joi.number()).allow(null).optional(),
  weaknesses: Joi.array().items(typeSchema).min(1).required(),
  prev_evolution: Joi.array()
    .items(
      Joi.object({
        num: Joi.string().required(),
        name: Joi.string().required(),
      }),
    )
    .optional(),
  next_evolution: Joi.array()
    .items(
      Joi.object({
        num: Joi.string().required(),
        name: Joi.string().required(),
      }),
    )
    .optional(),
})
